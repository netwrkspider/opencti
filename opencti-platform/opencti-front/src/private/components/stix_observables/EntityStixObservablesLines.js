import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListLinesContent from '../../../components/list_lines/ListLinesContent';
import {
  EntityStixObservableLine,
  EntityStixObservableLineDummy,
} from './EntityStixObservableLine';

const nbOfRowsToLoad = 25;

class EntityStixObservablesLines extends Component {
  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      entityLink,
      paginationOptions,
    } = this.props;
    return (
      <ListLinesContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr([], ['stixRelations', 'edges'], this.props.data)}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['stixRelations', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={<EntityStixObservableLine />}
        DummyLineComponent={<EntityStixObservableLineDummy />}
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        paginationOptions={paginationOptions}
        entityLink={entityLink}
      />
    );
  }
}

EntityStixObservablesLines.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  data: PropTypes.object,
  relay: PropTypes.object,
  stixRelations: PropTypes.object,
  initialLoading: PropTypes.bool,
  entityLink: PropTypes.string,
};

export const entityStixObservablesLinesQuery = graphql`
  query EntityStixObservablesLinesPaginationQuery(
    $fromId: String
    $toTypes: [String]
    $inferred: Boolean
    $relationType: String
    $resolveInferences: Boolean
    $resolveRelationType: String
    $resolveRelationRole: String
    $resolveRelationToTypes: [String]
    $resolveViaTypes: [EntityRelation]
    $firstSeenStart: DateTime
    $firstSeenStop: DateTime
    $lastSeenStart: DateTime
    $lastSeenStop: DateTime
    $weights: [Int]
    $count: Int!
    $cursor: ID
    $orderBy: StixRelationsOrdering
    $orderMode: OrderingMode
  ) {
    ...EntityStixObservablesLines_data
      @arguments(
        fromId: $fromId
        toTypes: $toTypes
        inferred: $inferred
        relationType: $relationType
        resolveInferences: $resolveInferences
        resolveRelationType: $resolveRelationType
        resolveRelationRole: $resolveRelationRole
        resolveRelationToTypes: $resolveRelationToTypes
        resolveViaTypes: $resolveViaTypes
        firstSeenStart: $firstSeenStart
        firstSeenStop: $firstSeenStop
        lastSeenStart: $lastSeenStart
        lastSeenStop: $lastSeenStop
        weights: $weights
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

export default createPaginationContainer(
  EntityStixObservablesLines,
  {
    data: graphql`
      fragment EntityStixObservablesLines_data on Query
        @argumentDefinitions(
          fromId: { type: "String" }
          toTypes: { type: "[String]" }
          inferred: { type: "Boolean" }
          relationType: { type: "String" }
          resolveInferences: { type: "Boolean" }
          resolveRelationType: { type: "String" }
          resolveRelationRole: { type: "String" }
          resolveRelationToTypes: { type: "[String]" }
          resolveViaTypes: { type: "[EntityRelation]" }
          firstSeenStart: { type: "DateTime" }
          firstSeenStop: { type: "DateTime" }
          lastSeenStart: { type: "DateTime" }
          lastSeenStop: { type: "DateTime" }
          weights: { type: "[Int]" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: { type: "StixRelationsOrdering", defaultValue: "first_seen" }
          orderMode: { type: "OrderingMode", defaultValue: "asc" }
        ) {
        stixRelations(
          fromId: $fromId
          toTypes: $toTypes
          inferred: $inferred
          relationType: $relationType
          resolveInferences: $resolveInferences
          resolveRelationType: $resolveRelationType
          resolveRelationRole: $resolveRelationRole
          resolveRelationToTypes: $resolveRelationToTypes
          resolveViaTypes: $resolveViaTypes
          firstSeenStart: $firstSeenStart
          firstSeenStop: $firstSeenStop
          lastSeenStart: $lastSeenStart
          lastSeenStop: $lastSeenStop
          weights: $weights
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_stixRelations") {
          edges {
            node {
              ...EntityStixObservableLine_node
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            globalCount
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.stixRelations;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        fromId: fragmentVariables.fromId,
        toTypes: fragmentVariables.toTypes,
        inferred: fragmentVariables.inferred,
        relationType: fragmentVariables.relationType,
        resolveInferences: fragmentVariables.resolveInferences,
        resolveRelationType: fragmentVariables.resolveRelationType,
        resolveRelationRole: fragmentVariables.resolveRelationRole,
        resolveRelationToTypes: fragmentVariables.resolveRelationToTypes,
        resolveViaTypes: fragmentVariables.resolveViaTypes,
        firstSeenStart: fragmentVariables.firstSeenStart,
        firstSeenStop: fragmentVariables.firstSeenStop,
        lastSeenStart: fragmentVariables.lastSeenStart,
        lastSeenStop: fragmentVariables.lastSeenStop,
        weights: fragmentVariables.weights,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: entityStixObservablesLinesQuery,
  },
);
