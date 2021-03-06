import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import {
  map, filter, head, compose,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import { CheckCircle } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler } from 'relay-runtime';
import { truncate } from '../../../../utils/String';
import inject18n from '../../../../components/i18n';
import { commitMutation } from '../../../../relay/environment';

const styles = theme => ({
  avatar: {
    width: 24,
    height: 24,
  },
  icon: {
    color: theme.palette.primary.main,
  },
});

const externalReferenceLinesMutationRelationAdd = graphql`
  mutation AddExternalReferencesLinesRelationAddMutation(
    $id: ID!
    $input: RelationAddInput!
  ) {
    externalReferenceEdit(id: $id) {
      relationAdd(input: $input) {
        node {
          ... on ExternalReference {
            id
            source_name
            description
            url
            hash
            external_id
          }
        }
        relation {
          id
        }
      }
    }
  }
`;

export const externalReferenceMutationRelationDelete = graphql`
  mutation AddExternalReferencesLinesRelationDeleteMutation(
    $id: ID!
    $relationId: ID!
  ) {
    externalReferenceEdit(id: $id) {
      relationDelete(relationId: $relationId) {
        node {
          ... on ExternalReference {
            id
          }
        }
      }
    }
  }
`;

const sharedUpdater = (store, userId, paginationOptions, newEdge) => {
  const userProxy = store.get(userId);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'Pagination_externalReferences',
    paginationOptions,
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class AddExternalReferencesLinesContainer extends Component {
  toggleExternalReference(externalReference) {
    const {
      entityId,
      entityExternalReferences,
      entityPaginationOptions,
    } = this.props;
    const entityExternalReferencesIds = map(
      n => n.node.id,
      entityExternalReferences,
    );
    const alreadyAdded = entityExternalReferencesIds.includes(
      externalReference.id,
    );

    if (alreadyAdded) {
      const existingExternalReference = head(
        filter(
          n => n.node.id === externalReference.id,
          entityExternalReferences,
        ),
      );
      commitMutation({
        mutation: externalReferenceMutationRelationDelete,
        variables: {
          id: externalReference.id,
          relationId: existingExternalReference.relation.id,
        },
        updater: (store) => {
          const container = store.getRoot();
          const userProxy = store.get(container.getDataID());
          const conn = ConnectionHandler.getConnection(
            userProxy,
            'Pagination_externalReferences',
            entityPaginationOptions,
          );
          ConnectionHandler.deleteNode(conn, externalReference.id);
        },
      });
    } else {
      const input = {
        fromRole: 'so',
        toId: externalReference.id,
        toRole: 'external_reference',
        through: 'external_references',
      };
      commitMutation({
        mutation: externalReferenceLinesMutationRelationAdd,
        variables: {
          id: entityId,
          input,
        },
        updater: (store) => {
          const payload = store
            .getRootField('externalReferenceEdit')
            .getLinkedRecord('relationAdd', { input });
          const container = store.getRoot();
          sharedUpdater(
            store,
            container.getDataID(),
            entityPaginationOptions,
            payload,
          );
        },
      });
    }
  }

  render() {
    const { classes, data, entityExternalReferences } = this.props;
    const entityExternalReferencesIds = map(
      n => n.node.id,
      entityExternalReferences,
    );
    return (
      <List>
        {data.externalReferences.edges.map((externalReferenceNode) => {
          const externalReference = externalReferenceNode.node;
          const alreadyAdded = entityExternalReferencesIds.includes(
            externalReference.id,
          );
          const externalReferenceId = externalReference.external_id
            ? `(${externalReference.external_id})`
            : '';
          return (
            <ListItem
              key={externalReference.id}
              classes={{ root: classes.menuItem }}
              divider={true}
              button={true}
              onClick={this.toggleExternalReference.bind(
                this,
                externalReference,
              )}
            >
              <ListItemIcon>
                {alreadyAdded ? (
                  <CheckCircle classes={{ root: classes.icon }} />
                ) : (
                  <Avatar classes={{ root: classes.avatar }}>
                    {externalReference.source_name.substring(0, 1)}
                  </Avatar>
                )}
              </ListItemIcon>
              <ListItemText
                primary={`${externalReference.source_name} ${externalReferenceId}`}
                secondary={truncate(
                  externalReference.description !== null
                    && externalReference.description.length > 0
                    ? externalReference.description
                    : externalReference.url,
                  120,
                )}
              />
            </ListItem>
          );
        })}
      </List>
    );
  }
}

AddExternalReferencesLinesContainer.propTypes = {
  entityId: PropTypes.string,
  entityExternalReferences: PropTypes.array,
  entityPaginationOptions: PropTypes.object,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

export const addExternalReferencesLinesQuery = graphql`
  query AddExternalReferencesLinesQuery(
    $search: String
    $count: Int!
    $cursor: ID
  ) {
    ...AddExternalReferencesLines_data
      @arguments(search: $search, count: $count, cursor: $cursor)
  }
`;

const AddExternalReferencesLines = createPaginationContainer(
  AddExternalReferencesLinesContainer,
  {
    data: graphql`
      fragment AddExternalReferencesLines_data on Query
        @argumentDefinitions(
          search: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
        ) {
        externalReferences(search: $search, first: $count, after: $cursor)
          @connection(key: "Pagination_externalReferences") {
          edges {
            node {
              id
              source_name
              description
              url
              external_id
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.externalReferences;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: addExternalReferencesLinesQuery,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(AddExternalReferencesLines);
