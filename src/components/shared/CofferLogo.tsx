interface CofferLogoProps {
  className?: string;
  size?: number;
}

export default function CofferLogo({ className, size = 32 }: CofferLogoProps) {
  return (
    <div className={`flex items-center gap-0 font-medium tracking-tight text-3xl sm:text-5xl ${className}`}>
      {/* The letter C */}
      <span>C</span>

      {/* The Logo as the letter 'o' */}
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Blue Circle Background */}
          <circle cx="50" cy="50" r="45" className="fill-primary" />

          {/* Padlock Icon */}
          <path
            d="M32 45V38C32 28.0589 40.0589 20 50 20C59.9411 20 68 28.0589 68 38V45H70C72.2091 45 74 46.7909 74 49V76C74 78.2091 72.2091 80 70 80H30C27.7909 80 26 78.2091 26 76V49C26 46.7909 27.7909 45 30 45H32ZM40 45H60V38C60 32.4772 55.5228 28 50 28C44.4772 28 40 32.4772 40 38V45Z"
            className="fill-yellow-400"
          />

          {/* Circular cutout in the lock body to mimic the 'c' inside */}
          <path
            d="M50 70C58.2843 70 65 63.2843 65 55C65 50.5 63 46.5 60 44L56 48C58 49.5 59 52 59 55C59 60 55 64 50 64C45 64 41 60 41 55C41 52 42 49.5 44 48L40 44C37 46.5 35 50.5 35 55C35 63.2843 41.7157 70 50 70Z"
            className="fill-primary"
          />
        </svg>
      </div>

      {/* The rest of the name */}
      <span>ffer</span>
    </div>
  );
}