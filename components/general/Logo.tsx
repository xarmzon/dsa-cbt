import Image from "next/image";
import Link from "next/link";

export type SizeType = "small" | "large";
export interface LogoProps {
  size?: SizeType;
  rounded?: boolean;
  children?: React.ReactNode;
}
const Logo = ({ size = "small", rounded = false }: LogoProps) => {
  return (
    <div className={`${size === "small" ? "h-8 w-8" : "h-20 w-20"}`}>
      <Link href="/">
        <a>
          <Image
            className={`object-cover ${rounded && "rounded-2xl"}`}
            src="/assets/images/logo.jpg"
            height={`${size === "small" ? "310" : "610"}`}
            width={`${size === "small" ? "310" : "610"}`}
          />
        </a>
      </Link>
    </div>
  );
};

export default Logo;
