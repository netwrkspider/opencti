import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListLinesContent from '../../../components/list_lines/ListLinesContent';
import { WorkspaceLine, WorkspaceLineDummy } from './WorkspaceLine';

const nbOfRowsToLoad = 25;

class WorkspacesLines extends Component {
  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      paginationOptions,
    } = this.props;
    return (
      <ListLinesContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr([], ['workspaces', 'edges'], this.props.data)}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['workspaces', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={<WorkspaceLine />}
        DummyLineComponent={<WorkspaceLineDummy />}
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        paginationOptions={paginationOptions}
      />
    );
  }
}

WorkspacesLines.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  data: PropTypes.object,
  relay: PropTypes.object,
  workspaces: PropTypes.object,
  initialLoading: PropTypes.bool,
};

export const workspacesLinesQuery = graphql`
  query WorkspacesLinesPaginationQuery(
    $workspaceType: String
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: WorkspacesOrdering
    $orderMode: OrderingMode
  ) {
    ...WorkspacesLines_data
      @arguments(
        workspaceType: $workspaceType
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

export default createPaginationContainer(
  WorkspacesLines,
  {
    data: graphql`
      fragment WorkspacesLines_data on Query
        @argumentDefinitions(
          workspaceType: { type: "String" }
          search: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: { type: "WorkspacesOrdering", defaultValue: "name" }
          orderMode: { type: "OrderingMode", defaultValue: "asc" }
        ) {
        workspaces(
          workspaceType: $workspaceType
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_workspaces") {
          edges {
            node {
              ...WorkspaceLine_node
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
      return props.data && props.data.workspaces;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        workspaceType: fragmentVariables.workspaceType,
        search: fragmentVariables.search,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: workspacesLinesQuery,
  },
);
