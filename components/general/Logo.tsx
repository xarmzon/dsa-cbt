import Image from "next/image";
import Link from "next/link";

export type SizeType = "small" | "large";
export interface LogoProps {
  size?: SizeType;
  children?: React.ReactNode;
}
const Logo = ({ size = "small" }: LogoProps) => {
  return (
    <div className={`${size === "small" ? "h-10 w-10" : "h-28 w-28"}`}>
      <Link href="/">
        <a>
          <Image
            className="object-contain"
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
