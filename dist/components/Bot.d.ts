import { BotMessageTheme, TextInputTheme, UserMessageTheme } from "@/features/bubble/types";
type messageType = "apiMessage" | "userMessage" | "usermessagewaiting";
export type MessageType = {
    message: string;
    type: messageType;
    sourceDocuments?: any;
};
export type MessageHistoryType = {
    chatflowid: string;
    content: string;
    createdDate: string;
    customerId: string;
    id: string;
    role: messageType;
    sourceDocuments: null;
};
export type FormData = {
    fullName: string;
    email: string;
    phone: string;
    message: string;
};
export type FormErrors = {
    fullName: string;
    email: string;
    phone: string;
    message: string;
};
export type BotProps = {
    chatflowid: string;
    apiHost?: string;
    hasCustomerForm?: boolean;
    chatflowConfig?: Record<string, unknown>;
    welcomeMessage?: string;
    botMessage?: BotMessageTheme;
    userMessage?: UserMessageTheme;
    textInput?: TextInputTheme;
    poweredByTextColor?: string;
    badgeBackgroundColor?: string;
    fontSize?: number;
};
export declare const Bot: (props: BotProps & {
    class?: string;
}) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=Bot.d.ts.map