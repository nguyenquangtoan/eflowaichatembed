import { MessageType } from "@/components/Bot";
import { sendRequest } from "@/utils/index";

export type IncomingInput = {
  question: string;
  history: MessageType[];
  overrideConfig?: Record<string, unknown>;
  socketIOClientId?: string;
};

export type CustomerInput = {
  ID: string;
  email?: string;
  companyId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber?: string;
  title?: string;
  origin?: string;
};

export type AddingMessageType = {
  role: string;
  content: string;
  chatflowid: string;
  customerId: string;
};

export type MessageRequest = {
  chatflowid: string;
  apiHost?: string;
  customerId?: string;
  body?: IncomingInput | AddingMessageType;
};

export type CustomerRequest = {
  chatflowid: string;
  apiHost?: string;
  body?: CustomerInput;
};

export const sendMessageQuery = ({
  chatflowid,
  apiHost = "http://localhost:3000",
  body,
}: MessageRequest) =>
  sendRequest<any>({
    method: "POST",
    url: `${apiHost}/api/v1/prediction/${chatflowid}`,
    body,
  });

export const createNewChatmessage = ({
  chatflowid,
  apiHost = "http://localhost:3000",
  body,
}: MessageRequest) =>
  sendRequest<any>({
    method: "POST",
    url: `${apiHost}/api/v1/chatmessage/${chatflowid}`,
    body,
  });

export const getMessageHistory = ({
  chatflowid,
  apiHost = "http://localhost:3000",
  customerId,
}: MessageRequest) =>
  sendRequest<any>({
    method: "GET",
    url: `${apiHost}/api/v1/chatmessage/${chatflowid}/customerId/${customerId}`,
  });

export const createCustomerBaseRow = ({
  chatflowid,
  apiHost = "http://localhost:3000",
  body,
}: CustomerRequest) =>
  sendRequest<any>({
    method: "POST",
    url: `${apiHost}/api/v1/customer/${chatflowid}`,
    body,
  });

export const isStreamAvailableQuery = ({
  chatflowid,
  apiHost = "http://localhost:3000",
}: MessageRequest) =>
  sendRequest<any>({
    method: "GET",
    url: `${apiHost}/api/v1/chatflows-streaming/${chatflowid}`,
  });
