import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { KeyboardArrowRight, Description } from '@material-ui/icons';
import { compose, pathOr, take } from 'ramda';
import inject18n from '../../../components/i18n';
import ItemMarking from '../../../components/ItemMarking';
import ItemStatus from '../../../components/ItemStatus';

const styles = theme => ({
  item: {
    paddingLeft: 10,
    transition: 'background-color 0.1s ease',
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  goIcon: {
    position: 'absolute',
    right: 10,
    marginRight: 0,
  },
  itemIconDisabled: {
    color: theme.palette.grey[700],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

class ReportLineComponent extends Component {
  render() {
    const {
      t, fd, classes, node, dataColumns,
    } = this.props;

    return (
      <ListItem
        classes={{ root: classes.item }}
        divider={true}
        component={Link}
        to={`/dashboard/reports/all/${node.id}`}
      >
        <ListItemIcon classes={{ root: classes.itemIcon }}>
          <Description />
        </ListItemIcon>
        <ListItemText
          primary={
            <div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.name.width }}
              >
                {node.name}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.createdByRef.width }}
              >
                {pathOr('', ['createdByRef', 'node', 'name'], node)}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.published.width }}
              >
                {fd(node.published)}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.object_status.width }}
              >
                <ItemStatus
                  status={node.object_status}
                  label={t(
                    `report_status_${
                      node.object_status ? node.object_status : 0
                    }`,
                  )}
                  variant="inList"
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.marking.width }}
              >
                {take(1, pathOr([], ['markingDefinitions', 'edges'], node)).map(
                  markingDefinition => (
                    <ItemMarking
                      key={markingDefinition.node.id}
                      variant="inList"
                      label={markingDefinition.node.definition}
                    />
                  ),
                )}
              </div>
            </div>
          }
        />
        <ListItemIcon classes={{ root: classes.goIcon }}>
          <KeyboardArrowRight />
        </ListItemIcon>
      </ListItem>
    );
  }
}

ReportLineComponent.propTypes = {
  dataColumns: PropTypes.object,
  node: PropTypes.object,
  classes: PropTypes.object,
  fd: PropTypes.func,
  t: PropTypes.func,
};

const ReportLineFragment = createFragmentContainer(ReportLineComponent, {
  node: graphql`
    fragment ReportLine_node on Report {
      id
      name
      object_status
      createdByRef {
        node {
          name
        }
      }
      published
      markingDefinitions {
        edges {
          node {
            id
            definition
          }
        }
      }
    }
  `,
});

export const ReportLine = compose(
  inject18n,
  withStyles(styles),
)(ReportLineFragment);

class ReportLineDummyComponent extends Component {
  render() {
    const { classes, dataColumns } = this.props;
    return (
      <ListItem classes={{ root: classes.item }} divider={true}>
        <ListItemIcon classes={{ root: classes.itemIconDisabled }}>
          <Description />
        </ListItemIcon>
        <ListItemText
          primary={
            <div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.name.width }}
              >
                <div className="fakeItem" style={{ width: '80%' }} />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.createdByRef.width }}
              >
                <div className="fakeItem" style={{ width: '70%' }} />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.published.width }}
              >
                <div className="fakeItem" style={{ width: '80%' }} />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.object_status.width }}
              >
                <div className="fakeItem" style={{ width: '60%' }} />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.marking.width }}
              >
                <div className="fakeItem" style={{ width: 100 }} />
              </div>
            </div>
          }
        />
        <ListItemIcon classes={{ root: classes.goIcon }}>
          <KeyboardArrowRight />
        </ListItemIcon>
      </ListItem>
    );
  }
}

ReportLineDummyComponent.propTypes = {
  classes: PropTypes.object,
  dataColumns: PropTypes.object,
};

export const ReportLineDummy = compose(
  inject18n,
  withStyles(styles),
)(ReportLineDummyComponent);
