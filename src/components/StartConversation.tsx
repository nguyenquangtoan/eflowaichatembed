import { ArrowIcon } from "@/components/icons/Arrow";
import { defaultChatBotTheme } from "@/constants";
import { createEffect, createSignal } from "solid-js";

interface StartConversationProps {
  buttonColor?: string;
  imgLogo?: string;
  handleStartConversation: (value: boolean) => void;
}

const StartConversation = (props: StartConversationProps) => {
  const customerLocal = localStorage.getItem("customer");
  const [isHavingConversation, setIsHavingConversation] = createSignal(false);
  createEffect(() => {
    if (customerLocal) {
      return setIsHavingConversation(true);
    }
    setIsHavingConversation(false);
  });
  const handleConversation = () => {
    props.handleStartConversation(true);
  };
  console.log("props.buttonColor", props.buttonColor);
  return (
    <div class="flex flex-col justify-start p-[30px]">
      <div>
        {" "}
        <img
          src={props.imgLogo ?? defaultChatBotTheme.avatarSrc}
          class="w-[50px]"
          alt=""
        />
      </div>
      <div>
        <p class="text-[24px] font-semibold my-[20px]">Hi there! 🙌</p>
        <p>
          We make it simple to connect with us. Feel free to ask us anything or
          share your feedback.
        </p>
      </div>
      <div class="mt-[30px]">
        {isHavingConversation() ? (
          <button
            class={
              "text-sm flex flex-row items-center rounded-md font-semibold p-[10px] hover:bg-slate-100 " +
              (props.buttonColor
                ? `text-[${props.buttonColor}]`
                : `text-[${defaultChatBotTheme.primaryColor}]`)
            }
            on:click={handleConversation}
          >
            Continue the conversation
            <ArrowIcon color={props.buttonColor} class="ml-[5px]" />
          </button>
        ) : (
          <button
            class={
              "text-sm flex flex-row items-center rounded-md font-semibold p-[10px] hover:bg-slate-100 " +
              (props.buttonColor
                ? `text-[${props.buttonColor}]`
                : `text-[${defaultChatBotTheme.primaryColor}]`)
            }
            on:click={handleConversation}
          >
            Start new conversation{" "}
            <ArrowIcon color={props.buttonColor} class="ml-[5px]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StartConversation;
