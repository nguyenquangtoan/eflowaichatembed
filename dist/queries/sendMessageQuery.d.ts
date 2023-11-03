import { MessageType } from "@/components/Bot";
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
export declare const sendMessageQuery: ({ chatflowid, apiHost, body, }: MessageRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
export declare const createNewChatmessage: ({ chatflowid, apiHost, body, }: MessageRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
export declare const getMessageHistory: ({ chatflowid, apiHost, customerId, }: MessageRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
export declare const createCustomerBaseRow: ({ chatflowid, apiHost, body, }: CustomerRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
export declare const isStreamAvailableQuery: ({ chatflowid, apiHost, }: MessageRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
//# sourceMappingURL=sendMessageQuery.d.ts.map