import { CircularProgress, Snackbar } from "@amplication/design-system";
import { isEmpty } from "lodash";
import React, { useContext, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../context/appContext";
import * as models from "../models";
import { formatError } from "../util/error";
import useServiceConnection from "./hooks/useServiceConnection";
import "./ServiceConnectionsList.scss";
import ServiceConnectionsListItem from "./ServiceConnectionsListItem";

type MessageBrokerListItem = {
  resource: models.Resource;
  connection: models.ServiceMessageBrokerConnection | undefined;
};

const CLASS_NAME = "service-connections-list";

type Props = {
  resourceId: string;
  selectFirst?: boolean;
};

export const ServiceConnectionsList = React.memo(
  ({ resourceId, selectFirst = false }: Props) => {
    const { currentWorkspace, currentProject, resources } = useContext(
      AppContext
    );

    const history = useHistory();

    const {
      serviceMessageBrokerConnections: data,
      loadingServiceMessageBrokerConnections: loading,
      errorServiceMessageBrokerConnections: error,
    } = useServiceConnection(resourceId);

    const errorMessage = formatError(error);

    const messageBrokerList = useMemo((): MessageBrokerListItem[] => {
      return resources
        .filter(
          (resource) =>
            resource.resourceType === models.EnumResourceType.MessageBroker
        )
        .map(
          (resource): MessageBrokerListItem => {
            return {
              resource,
              connection: data?.ServiceMessageBrokerConnections.find(
                (connection) => connection.messageBrokerId === resource.id
              ),
            };
          }
        );
    }, [resources, data?.ServiceMessageBrokerConnections]);

    useEffect(() => {
      if (selectFirst && !isEmpty(messageBrokerList)) {
        const resource = messageBrokerList[0].resource;
        const connectionUrl = `/${currentWorkspace?.id}/${currentProject?.id}/${resourceId}/service-connections/${resource.id}`;
        history.push(connectionUrl);
      }
    }, [
      messageBrokerList,
      selectFirst,
      resourceId,
      history,
      currentWorkspace,
      currentProject,
    ]);

    return (
      <div className={CLASS_NAME}>
        <div className={`${CLASS_NAME}__header`}>Message Brokers</div>
        {loading && <CircularProgress />}
        <div className={`${CLASS_NAME}__list`}>
          {messageBrokerList.map((connection, index) => {
            if (
              !currentProject?.id ||
              !currentWorkspace?.id ||
              connection?.connection?.enabled === undefined
            ) {
              return null;
            }
            return (
              <ServiceConnectionsListItem
                key={index}
                currentProjectId={currentProject.id}
                currentWorkspaceId={currentWorkspace.id}
                enabled={connection.connection.enabled}
                resourceId={resourceId}
                connectionResource={connection.resource}
              />
            );
          })}
        </div>

        <Snackbar open={Boolean(error)} message={errorMessage} />
      </div>
    );
  }
);
