/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [],
  theme: {
    extend: {
      colors: {
        "nts-green": "#95CE26",
        "nts-grey": "#C0C0C0",
        "nts-black": "#231F20",
        "nts-dark-green": "#008000",
        "nts-text-green": "#9BBB59",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        abadi: ["Abadi MT Std Bold"],
        verdana: ["Verdana", "sans-serif"],
        serif: ["Times New Roman", "Times", "serif"], // This sets Times New Roman as the default serif font
      },
      
      
      boxShadow: {
        card: "0px 3px 4px 3px rgba(21,53,88,1)",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            ".first-letter\\:capitalize": {
              "&::first-letter": {
                textTransform: "capitalize",
              },
            },
          },
        },
      }),
    },
  },
};
