import { JSX } from "solid-js/jsx-runtime";
const defaultButtonColor = "#0076ff";
export const ArrowIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14.25 9L9.75 13.5M14.25 9L9.75 4.5M14.25 9L3.75 9"
      style={{ stroke: props.color ? props.color : defaultButtonColor }}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
