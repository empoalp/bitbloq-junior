import React, { FC } from "react";
import { IBloq, IBloqType } from "../../index";

interface IWaitIconProps {
  bloq?: IBloq;
}

const WaitIcon: FC<IWaitIconProps> = ({ bloq }) => {
  const value = bloq && bloq.parameters && bloq.parameters.value;

  if (!value) {
    return (
      <svg width="1em" height="1em" viewBox="0 0 44 44">
        <path
          fillRule="evenodd"
          d="M21.922 34.165c5.877 0 10.66-4.783 10.66-10.66s-4.783-10.659-10.66-10.659c-5.878 0-10.66 4.782-10.66 10.659 0 5.877 4.782 10.66 10.66 10.66zm0-22.62c6.595 0 11.96 5.365 11.96 11.96 0 6.595-5.365 11.96-11.96 11.96-6.595 0-11.961-5.365-11.961-11.96 0-6.595 5.366-11.96 11.961-11.96zm0 26.234c7.871 0 14.273-6.403 14.273-14.274 0-6.825-4.823-12.517-11.233-13.916-.441.739-1.738 1.083-3.04 1.083s-2.598-.344-3.04-1.083c-6.41 1.4-11.233 7.091-11.233 13.916 0 7.87 6.402 14.274 14.273 14.274zm-1.91-32.164v3.332c.176.159.862.424 1.91.424s1.734-.265 1.91-.424V5.615c-.176-.16-.862-.425-1.91-.425s-1.734.265-1.91.425zm5.121 2.667c7.05 1.487 12.364 7.737 12.364 15.223 0 8.588-6.987 15.575-15.575 15.575S6.347 32.093 6.347 23.505c0-7.485 5.315-13.736 12.364-15.222v-2.75c0-1.13 1.664-1.644 3.211-1.644s3.211.515 3.211 1.645v2.748zm-3.211 9.078a.65.65 0 01-.65-.65v-1.805a.65.65 0 011.3 0v1.804a.65.65 0 01-.65.651zm0 6.796a.652.652 0 01-.46-1.112l6.08-6.08a.652.652 0 01.92.921l-6.08 6.08a.652.652 0 01-.46.19zm-6.145-.651a.65.65 0 01-.65.65h-1.804a.65.65 0 010-1.301h1.804c.36 0 .65.291.65.65zm.526-6.54l1.274 1.274a.653.653 0 01-.46 1.112.652.652 0 01-.46-.19l-1.275-1.276a.65.65 0 11.92-.92zm14.218 5.89a.65.65 0 110 1.3h-1.804a.65.65 0 110-1.3h1.804zm-3.334 4.994l1.275 1.276a.652.652 0 01-.92.921l-1.275-1.276a.65.65 0 11.92-.92zm-5.265 1.8c.36 0 .65.292.65.651v1.804a.65.65 0 01-1.3 0V30.3c0-.36.29-.65.65-.65zm-5.265-1.8a.652.652 0 01.92.921l-1.275 1.275a.652.652 0 01-.92-.92l1.275-1.276z"
        />
      </svg>
    );
  }

  return (
    <svg width="1em" height="1em" viewBox="0 0 44 44">
      <g fillRule="evenodd">
        <path d="M11.5 21.53c3.962 0 7.186-3.242 7.186-7.228 0-3.986-3.224-7.228-7.186-7.228-3.963 0-7.186 3.242-7.186 7.228 0 3.986 3.223 7.228 7.186 7.228zm0-15.339c4.446 0 8.063 3.639 8.063 8.11 0 4.474-3.617 8.112-8.063 8.112-4.446 0-8.063-3.638-8.063-8.111 0-4.472 3.617-8.11 8.063-8.11zm0 17.79c5.306 0 9.622-4.342 9.622-9.679a9.666 9.666 0 00-7.572-9.437c-.298.501-1.172.735-2.05.735-.878 0-1.751-.234-2.05-.735a9.666 9.666 0 00-7.572 9.437c0 5.337 4.316 9.68 9.622 9.68zm-1.287-21.81V4.43c.118.108.58.287 1.287.287s1.17-.18 1.287-.287V2.17c-.118-.108-.58-.288-1.287-.288s-1.17.18-1.287.288zm3.452 1.808A10.556 10.556 0 0122 14.302c0 5.824-4.71 10.562-10.5 10.562S1 20.126 1 14.302C1 9.226 4.583 4.987 9.335 3.98V2.115C9.335 1.35 10.457 1 11.5 1s2.165.349 2.165 1.115V3.98zM11.5 10.135a.44.44 0 01-.439-.441V8.47a.44.44 0 11.878 0v1.223a.44.44 0 01-.439.441zm0 4.608a.438.438 0 01-.31-.129.445.445 0 010-.624l4.098-4.123a.438.438 0 01.62 0 .443.443 0 010 .624l-4.098 4.123a.438.438 0 01-.31.13zm-4.142-.441a.44.44 0 01-.44.441H5.704a.44.44 0 01-.439-.441.44.44 0 01.439-.441H6.92a.44.44 0 01.439.441zm.354-4.435l.859.864c.17.173.17.452 0 .625a.438.438 0 01-.62 0l-.86-.865a.443.443 0 010-.624.438.438 0 01.62 0zm9.585 3.994a.44.44 0 01.439.441.44.44 0 01-.439.441h-1.216a.44.44 0 01-.439-.44.44.44 0 01.439-.442h1.216zm-2.247 3.387l.859.865a.444.444 0 010 .625.438.438 0 01-.62 0l-.86-.866a.443.443 0 010-.624.438.438 0 01.62 0zm-3.55 1.22a.44.44 0 01.439.442v1.223a.44.44 0 11-.878 0V18.91a.44.44 0 01.439-.441zm-3.55-1.22a.438.438 0 01.62 0 .443.443 0 010 .624l-.858.865a.438.438 0 01-.62 0 .445.445 0 010-.625l.858-.864z" />
        <text
          fontFamily="Roboto-Bold, Roboto"
          fontSize={18}
          fontWeight="bold"
          opacity={0.9}
          textAnchor="middle"
        >
          <tspan x={30} y={39}>
            {value}
          </tspan>
        </text>
      </g>
    </svg>
  );
};

export default WaitIcon;
