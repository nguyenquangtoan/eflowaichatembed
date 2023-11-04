import { createSignal, createEffect, For, onMount } from "solid-js";
import {
  sendMessageQuery,
  isStreamAvailableQuery,
  IncomingInput,
  createNewChatmessage,
  getMessageHistory,
  createCustomerBaseRow,
} from "@/queries/sendMessageQuery";
import { TextInput } from "./inputs/textInput";
import { GuestBubble } from "./bubbles/GuestBubble";
import { BotBubble } from "./bubbles/BotBubble";
import { LoadingBubble } from "./bubbles/LoadingBubble";
import { SourceBubble } from "./bubbles/SourceBubble";
import {
  BotMessageTheme,
  TextInputTheme,
  UserMessageTheme,
} from "@/features/bubble/types";
import { Badge } from "./Badge";
import socketIOClient from "socket.io-client";
import { Popup } from "@/features/popup";
import { v4 as uuidv4 } from "uuid";
import StartConversation from "@/components/StartConversation";
import { defaultChatBotTheme } from "@/constants";

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
  chatflowConfig?: Record<string, unknown>;
  welcomeMessage?: string;
  botMessage?: BotMessageTheme;
  userMessage?: UserMessageTheme;
  textInput?: TextInputTheme;
  poweredByTextColor?: string;
  badgeBackgroundColor?: string;
  fontSize?: number;
};

const defaultWelcomeMessage = "Hi there! How can I help?";

/*const sourceDocuments = [
    {
        "pageContent": "I know some are talking about “living with COVID-19”. Tonight – I say that we will never just accept living with COVID-19. \r\n\r\nWe will continue to combat the virus as we do other diseases. And because this is a virus that mutates and spreads, we will stay on guard. \r\n\r\nHere are four common sense steps as we move forward safely.  \r\n\r\nFirst, stay protected with vaccines and treatments. We know how incredibly effective vaccines are. If you’re vaccinated and boosted you have the highest degree of protection. \r\n\r\nWe will never give up on vaccinating more Americans. Now, I know parents with kids under 5 are eager to see a vaccine authorized for their children. \r\n\r\nThe scientists are working hard to get that done and we’ll be ready with plenty of vaccines when they do. \r\n\r\nWe’re also ready with anti-viral treatments. If you get COVID-19, the Pfizer pill reduces your chances of ending up in the hospital by 90%.",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "loc": {
            "lines": {
              "from": 450,
              "to": 462
            }
          }
        }
    },
    {
        "pageContent": "sistance,  and  polishing  [65].  For  instance,  AI  tools  generate\nsuggestions based on inputting keywords or topics. The tools\nanalyze  search  data,  trending  topics,  and  popular  queries  to\ncreate  fresh  content.  What’s  more,  AIGC  assists  in  writing\narticles and posting blogs on specific topics. While these tools\nmay not be able to produce high-quality content by themselves,\nthey can provide a starting point for a writer struggling with\nwriter’s block.\nH.  Cons of AIGC\nOne of the main concerns among the public is the potential\nlack  of  creativity  and  human  touch  in  AIGC.  In  addition,\nAIGC sometimes lacks a nuanced understanding of language\nand context, which may lead to inaccuracies and misinterpre-\ntations. There are also concerns about the ethics and legality\nof using AIGC, particularly when it results in issues such as\ncopyright  infringement  and  data  privacy.  In  this  section,  we\nwill discuss some of the disadvantages of AIGC (Table IV).",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "pdf": {
            "version": "1.10.100",
            "info": {
              "PDFFormatVersion": "1.5",
              "IsAcroFormPresent": false,
              "IsXFAPresent": false,
              "Title": "",
              "Author": "",
              "Subject": "",
              "Keywords": "",
              "Creator": "LaTeX with hyperref",
              "Producer": "pdfTeX-1.40.21",
              "CreationDate": "D:20230414003603Z",
              "ModDate": "D:20230414003603Z",
              "Trapped": {
                "name": "False"
              }
            },
            "metadata": null,
            "totalPages": 17
          },
          "loc": {
            "pageNumber": 8,
            "lines": {
              "from": 301,
              "to": 317
            }
          }
        }
    },
    {
        "pageContent": "Main article: Views of Elon Musk",
        "metadata": {
          "source": "https://en.wikipedia.org/wiki/Elon_Musk",
          "loc": {
            "lines": {
              "from": 2409,
              "to": 2409
            }
          }
        }
    },
    {
        "pageContent": "First Name: John\nLast Name: Doe\nAddress: 120 jefferson st.\nStates: Riverside\nCode: NJ\nPostal: 8075",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "line": 1,
          "loc": {
            "lines": {
              "from": 1,
              "to": 6
            }
          }
        }
    },
]*/
type Inputs = {
  fullName: string;
  exampleRequired: string;
};

export const Bot = (props: BotProps & { class?: string }) => {
  let chatContainer: HTMLDivElement | undefined;
  let bottomSpacer: HTMLDivElement | undefined;
  let botContainer: HTMLDivElement | undefined;

  const [userInput, setUserInput] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [sourcePopupOpen, setSourcePopupOpen] = createSignal(false);
  const [sourcePopupSrc, setSourcePopupSrc] = createSignal({});
  const [messages, setMessages] = createSignal<MessageType[]>(
    [
      {
        message: props.welcomeMessage ?? defaultWelcomeMessage,
        type: "apiMessage",
      },
    ],
    { equals: false }
  );
  const [socketIOClientId, setSocketIOClientId] = createSignal("");
  const [isChatFlowAvailableToStream, setIsChatFlowAvailableToStream] =
    createSignal(false);
  const [chatHistory, setChatHistory] = createSignal<MessageHistoryType[]>();
  const [hasCurrentCustomer, setHasCurrentCustomer] = createSignal(false);
  const [isStartingConversation, setIsStartingConversation] =
    createSignal(false);

  onMount(() => {
    if (!bottomSpacer) return;
    setTimeout(() => {
      chatContainer?.scrollTo(0, chatContainer.scrollHeight);
    }, 50);
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      chatContainer?.scrollTo(0, chatContainer.scrollHeight);
    }, 50);
  };

  const updateLastMessage = (text: string) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, message: item.message + text };
        }
        return item;
      });
      return [...updated];
    });
  };

  const updateLastMessageSourceDocuments = (sourceDocuments: any) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, sourceDocuments: sourceDocuments };
        }
        return item;
      });
      return [...updated];
    });
  };

  // Get chatmessages successful
  createEffect(() => {
    const history = chatHistory();

    if (history) {
      const loadedMessages: MessageType[] = [];
      for (const message of history) {
        const obj: MessageType = {
          message: message.content,
          type: message.role,
        };
        if (message.sourceDocuments) {
          obj.sourceDocuments = JSON.parse(message?.sourceDocuments);
        }

        loadedMessages.push(obj);
      }
      setMessages((prevMessages) => [...prevMessages, ...loadedMessages]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory]);

  const addChatMessage = async (
    message: any,
    type: any,
    sourceDocuments?: any
  ) => {
    try {
      const currentCustomer = JSON.parse(
        localStorage?.getItem("customer") || ""
      );
      if (currentCustomer) {
        const newChatMessageBody: any = {
          role: type,
          content: message,
          chatflowid: props.chatflowid,
          customerId: currentCustomer?.ID,
        };
        if (sourceDocuments)
          newChatMessageBody.sourceDocuments = JSON.stringify(sourceDocuments);
        await createNewChatmessage({
          chatflowid: props.chatflowid,
          apiHost: props.apiHost,
          body: newChatMessageBody,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle errors
  const handleError = (
    message = "Oops! There seems to be an error. Please try again."
  ) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { message, type: "apiMessage" },
    ]);
    addChatMessage(message, "apiMessage");
    setLoading(false);
    setUserInput("");
    scrollToBottom();
  };

  // Handle form submission
  const handleSubmitMessage = async (value: string) => {
    setUserInput(value);

    if (value.trim() === "") {
      return;
    }

    setLoading(true);
    scrollToBottom();

    // Send user question and history to API
    const welcomeMessage = props.welcomeMessage ?? defaultWelcomeMessage;
    const messageList = messages().filter(
      (msg) => msg.message !== welcomeMessage
    );

    setMessages((prevMessages) => [
      ...prevMessages,
      { message: value, type: "userMessage" },
    ]);

    // waiting for first chatmessage saved, the first chatmessage will be used in sendMessageAndGetPrediction
    await addChatMessage(value, "userMessage");

    const body: IncomingInput = {
      question: value,
      history: messageList,
    };

    if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig;

    if (isChatFlowAvailableToStream())
      body.socketIOClientId = socketIOClientId();

    const result = await sendMessageQuery({
      chatflowid: props.chatflowid,
      apiHost: props.apiHost,
      body,
    });

    if (result.data) {
      const data = handleVectaraMetadata(result.data);

      if (typeof data === "object" && data.text && data.sourceDocuments) {
        if (!isChatFlowAvailableToStream()) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              message: data.text,
              sourceDocuments: data.sourceDocuments,
              type: "apiMessage",
            },
          ]);
          addChatMessage(data.text, "apiMessage", data.sourceDocuments);
        }
      } else {
        if (!isChatFlowAvailableToStream()) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { message: data, type: "apiMessage" },
          ]);
        }

        addChatMessage(data, "apiMessage");
      }
      setLoading(false);
      setUserInput("");
      scrollToBottom();
    }
    if (result.error) {
      const error = result.error;
      console.error(error);
      const err: any = error;
      const errorData =
        typeof err === "string"
          ? err
          : err.response.data ||
            `${err.response.status}: ${err.response.statusText}`;
      handleError(errorData);
      return;
    }
  };

  // Auto scroll chat to bottom
  createEffect(() => {
    if (messages()) scrollToBottom();
  });

  createEffect(() => {
    if (props.fontSize && botContainer)
      botContainer.style.fontSize = `${props.fontSize}px`;
  });

  // eslint-disable-next-line solid/reactivity
  createEffect(async () => {
    const currentCustomerFromLocal = localStorage.getItem("customer");
    // if (currentCustomerFromLocal || hasCurrentCustomer()) {
    if (currentCustomerFromLocal && isStartingConversation()) {
      const currentCustomer = JSON.parse(currentCustomerFromLocal);
      setHasCurrentCustomer(true);
      const { data } = await isStreamAvailableQuery({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
      });

      const { data: chatMessageHistory } = await getMessageHistory({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        customerId: currentCustomer?.ID,
      });

      setChatHistory(chatMessageHistory);

      if (data) {
        setIsChatFlowAvailableToStream(data?.isStreaming ?? false);
      }

      const socket = socketIOClient(props.apiHost as string);

      socket.on("connect", () => {
        setSocketIOClientId(socket.id);
      });

      socket.on("start", () => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { message: "", type: "apiMessage" },
        ]);
      });

      socket.on("sourceDocuments", updateLastMessageSourceDocuments);

      socket.on("token", updateLastMessage);

      // eslint-disable-next-line solid/reactivity
      return () => {
        setUserInput("");
        setLoading(false);
        setMessages([
          {
            message: props.welcomeMessage ?? defaultWelcomeMessage,
            type: "apiMessage",
          },
        ]);
        if (socket) {
          socket.disconnect();
          setSocketIOClientId("");
        }
      };
    } else {
      setHasCurrentCustomer(false);
    }
    // }
  }, [hasCurrentCustomer]);

  const isValidURL = (url: string): URL | undefined => {
    try {
      return new URL(url);
    } catch (err) {
      return undefined;
    }
  };

  const handleVectaraMetadata = (message: any): any => {
    if (message.sourceDocuments && message.sourceDocuments[0].metadata.length) {
      message.sourceDocuments = message.sourceDocuments.map((docs: any) => {
        const newMetadata: { [name: string]: any } = docs.metadata.reduce(
          (newMetadata: any, metadata: any) => {
            newMetadata[metadata.name] = metadata.value;
            return newMetadata;
          },
          {}
        );
        return {
          pageContent: docs.pageContent,
          metadata: newMetadata,
        };
      });
    }
    return message;
  };

  const removeDuplicateURL = (message: MessageType) => {
    const visitedURLs: string[] = [];
    const newSourceDocuments: any = [];

    message = handleVectaraMetadata(message);

    message.sourceDocuments.forEach((source: any) => {
      if (
        isValidURL(source.metadata.source) &&
        !visitedURLs.includes(source.metadata.source)
      ) {
        visitedURLs.push(source.metadata.source);
        newSourceDocuments.push(source);
      } else if (!isValidURL(source.metadata.source)) {
        newSourceDocuments.push(source);
      }
    });
    return newSourceDocuments;
  };

  const [formData, setFormData] = createSignal<FormData>({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = createSignal<FormErrors>({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const validateEmail = (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validate = () => {
    const newErrors: FormErrors = {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    };
    if (!formData().fullName) {
      newErrors.fullName = "Full Name is required";
    }
    if (!formData().email) {
      newErrors.email = "Valid email is required";
    } else if (!validateEmail(formData().email)) {
      newErrors.email = "Invalid email";
    }
    if (!formData().phone) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData().message) {
      newErrors.message = "Message is required";
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleInput = (field: keyof FormData) => (e: Event) => {
    setFormData({
      ...formData(),
      [field]: (e.target as HTMLInputElement).value,
    });
  };

  const handleSubmitCustomerForm = async (event: Event) => {
    event.preventDefault();
    if (validate()) {
      const generatedID = uuidv4();
      await createCustomerBaseRow({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        body: {
          ID: generatedID,
          email: formData().email,
          name: formData().fullName,
          phoneNumber: formData().phone,
          origin: window.location.origin,
        },
      }).then(async (response) => {
        const customer = response.data;
        setHasCurrentCustomer(true);
        localStorage.setItem("customer", JSON.stringify(customer));
        await handleSubmitMessage(formData().message).then(async () => {
          setUserInput("");
          const body: IncomingInput = {
            question: `My name is ${formData().fullName}, email is ${
              formData().email
            } and my phone is ${formData().phone}`,
            history: [],
          };

          if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig;

          if (isChatFlowAvailableToStream())
            body.socketIOClientId = socketIOClientId();

          await sendMessageQuery({
            chatflowid: props.chatflowid,
            apiHost: props.apiHost,
            body,
          });
        });
      });
      // Handle form submission logic here
    }
  };

  const handleSkipForm = async () => {
    const generatedID = uuidv4();
    await createCustomerBaseRow({
      chatflowid: props.chatflowid,
      apiHost: props.apiHost,
      body: {
        ID: generatedID,
        name: "Anonymous",
        origin: window.location.origin,
      },
    }).then((response) => {
      const customer = response.data;
      localStorage.setItem("customer", JSON.stringify(customer));
      setHasCurrentCustomer(true);
    });
  };

  const handleStartConversation = (value: boolean) => {
    setIsStartingConversation(value);
  };

  return (
    <>
      <div
        ref={botContainer}
        class={
          "relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center chatbot-container " +
          props.class
        }
      >
        <div class="flex w-full h-full justify-center">
          {!isStartingConversation() ? (
            <StartConversation
              buttonColor={props.textInput?.sendButtonColor}
              imgLogo={props.botMessage?.avatarSrc}
              handleStartConversation={handleStartConversation}
            />
          ) : (
            <>
              {!hasCurrentCustomer() ? (
                <div class="flex flex-col justify-start min-w-full w-full min-h-full px-4 pt-10 relative chatbot-chat-view scroll-smooth">
                  <div>
                    <img
                      src={
                        props.botMessage?.avatarSrc ??
                        defaultChatBotTheme.fullLogo
                      }
                      class="w-[150px]"
                      alt=""
                    />
                    <p class="mt-[10px]">
                      Share your queries or comments here. 🤖
                    </p>
                  </div>

                  <form
                    class="w-full mt-[10px]"
                    onSubmit={handleSubmitCustomerForm}
                  >
                    <p class="text-[14px] mt-[10px]">Full Name</p>
                    <input
                      class="w-full text-[14px] border-slate-300 border-[1px] border-solid rounded-md mt-[5px] mb-[3px]"
                      name="fullName"
                      type="text"
                      value={formData().fullName}
                      onInput={handleInput("fullName")}
                      placeholder="Please enter your full name"
                    />
                    {errors().fullName && (
                      <div class="text-red-500 text-xs mb-[10px]">
                        {errors().fullName}
                      </div>
                    )}
                    <p class="text-[14px] mt-[10px]">Phone Number</p>
                    <input
                      class="w-full text-[14px] border-slate-300 border-[1px] border-solid rounded-md mt-[5px] mb-[3px]"
                      name="phone"
                      type="text"
                      value={formData().phone}
                      onInput={handleInput("phone")}
                      placeholder="Please enter your phone number"
                    />
                    {errors().phone && (
                      <div class="text-red-500 text-xs mb-[10px]">
                        {errors().phone}
                      </div>
                    )}
                    <p class="text-[14px] mt-[10px]">Email</p>
                    <input
                      class="w-full text-[14px] border-slate-300 border-[1px] border-solid rounded-md mt-[5px] mb-[3px]"
                      name="email"
                      value={formData().email}
                      onInput={handleInput("email")}
                      type="text"
                      placeholder="Please enter your email"
                    />
                    {errors().email && (
                      <div class="text-red-500 text-xs mb-[10px]">
                        {errors().email}
                      </div>
                    )}
                    <p class="text-[14px] mt-[10px]">Message</p>
                    <textarea
                      class="w-full text-[14px] border-slate-300 border-[1px] border-solid rounded-md mt-[5px] mb-[3px] h-[100px] p-[5px]"
                      name="message"
                      value={formData().message}
                      onInput={handleInput("message")}
                      placeholder="Please enter your message"
                    />
                    {errors().message && (
                      <div class="text-red-500 text-xs mb-[10px]">
                        {errors().message}
                      </div>
                    )}

                    <button
                      type="submit"
                      class="w-full text-white bg-[#0076ff] mt-[10px] rounded-md h-[36px]"
                    >
                      Send
                    </button>
                    <div class="w-full text-center mt-[10px] ">
                      <p
                        class=" text-[#0076ff] cursor-pointer "
                        onClick={handleSkipForm}
                      >
                        Skip
                      </p>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div
                    style={{ "padding-bottom": "100px" }}
                    ref={chatContainer}
                    class="overflow-y-scroll min-w-full w-full min-h-full px-3 pt-10 relative scrollable-container chatbot-chat-view scroll-smooth"
                  >
                    <For each={[...messages()]}>
                      {(message, index) => (
                        <>
                          {message.type === "userMessage" && (
                            <GuestBubble
                              message={message.message}
                              backgroundColor={
                                props.userMessage?.backgroundColor
                              }
                              textColor={props.userMessage?.textColor}
                              showAvatar={props.userMessage?.showAvatar}
                              avatarSrc={props.userMessage?.avatarSrc}
                            />
                          )}
                          {message.type === "apiMessage" && (
                            <BotBubble
                              message={message.message}
                              backgroundColor={
                                props.botMessage?.backgroundColor
                              }
                              textColor={props.botMessage?.textColor}
                              showAvatar={props.botMessage?.showAvatar}
                              avatarSrc={props.botMessage?.avatarSrc}
                            />
                          )}
                          {message.type === "userMessage" &&
                            loading() &&
                            index() === messages().length - 1 && (
                              <LoadingBubble />
                            )}
                          {message.sourceDocuments &&
                            message.sourceDocuments.length && (
                              <div
                                style={{
                                  display: "flex",
                                  "flex-direction": "row",
                                  width: "100%",
                                }}
                              >
                                <For each={[...removeDuplicateURL(message)]}>
                                  {(src) => {
                                    const URL = isValidURL(src.metadata.source);
                                    return (
                                      <SourceBubble
                                        pageContent={
                                          URL ? URL.pathname : src.pageContent
                                        }
                                        metadata={src.metadata}
                                        onSourceClick={() => {
                                          if (URL) {
                                            window.open(
                                              src.metadata.source,
                                              "_blank"
                                            );
                                          } else {
                                            setSourcePopupSrc(src);
                                            setSourcePopupOpen(true);
                                          }
                                        }}
                                      />
                                    );
                                  }}
                                </For>
                              </div>
                            )}
                        </>
                      )}
                    </For>
                  </div>
                  <TextInput
                    backgroundColor={props.textInput?.backgroundColor}
                    textColor={props.textInput?.textColor}
                    placeholder={props.textInput?.placeholder}
                    sendButtonColor={props.textInput?.sendButtonColor}
                    fontSize={props.fontSize}
                    defaultValue={userInput()}
                    onSubmit={handleSubmitMessage}
                  />
                </>
              )}
            </>
          )}
        </div>

        <Badge
          badgeBackgroundColor={props.badgeBackgroundColor}
          poweredByTextColor={props.poweredByTextColor}
          botContainer={botContainer}
        />

        <BottomSpacer ref={bottomSpacer} />
      </div>
      {sourcePopupOpen() && (
        <Popup
          isOpen={sourcePopupOpen()}
          value={sourcePopupSrc()}
          onClose={() => setSourcePopupOpen(false)}
        />
      )}
    </>
  );
};

type BottomSpacerProps = {
  ref: HTMLDivElement | undefined;
};
const BottomSpacer = (props: BottomSpacerProps) => {
  return <div ref={props.ref} class="w-full h-32" />;
};
