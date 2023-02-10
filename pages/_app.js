import "../styles/globals.css";
import Script from "next/script";
import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource/syne";
import { defineStyle, defineStyleConfig, extendTheme } from "@chakra-ui/react";
import { tooltipTheme } from "components/Tooltip";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains(
  [chain.polygon],
  [
    jsonRpcProvider({ rpc: () => ({ http: "https://rpc.ankr.com/eth" }) }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  const theme = extendTheme({
    components: {
      Tooltip: tooltipTheme,
    },
  })


  
  return (
    <>
      <Head>
        <title>aimint.fun</title>

        <link rel="shortcut icon" href="favicon.png" />

        <meta
          name="viewport"
          key="main"
          content="width=device-width, initial-scale=1.0"
        />

        <meta
          name="title"
          content="AI Mint — generative art meets digital wallets"
        />
        <meta
          name="description"
          content="ai creativity meets web3, mint gasless nft's straight out of stable diffusion"
        />

        <meta property="og:type" content="website" key="og-type" />
        <meta property="og:url" content="https://aimint.fun/" key="og-url" />
        <meta
          property="og:title"
          content="AI Mint — generative art meets digital wallets"
          key="og-title"
        />
        <meta
          property="og:description"
          content="ai creativity meets web3, mint gasless nft's straight out of stable diffusion"
          key="og-desc"
        />
        <meta
          property="og:image"
          content="https://i.postimg.cc/KYw10ZB4/aimintog.png"
          key="og-image"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://aimint.fun/"
          key="twt-url"
        />
        <meta
          property="twitter:title"
          content="AI Mint — generative art meets digital wallets"
          key="twt-title"
        />
        <meta
          property="twitter:description"
          content="ai creativity meets web3, mint gasless nft's straight out of stable diffusion"
          key="twt-desc"
        />
        <meta
          property="twitter:image"
          content="https://i.postimg.cc/KYw10ZB4/aimintog.png"
          key="twt-img"
        />
      </Head>
      <div>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-SC89JTD45T"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-SC89JTD45T');
        `}
        </Script>
      </div>

      <ChakraProvider theme={theme}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider
            chains={chains}
            theme={lightTheme({
              accentColor: "#EDF2F7",
              accentColorForeground: "black",
              borderRadius: "small",
              fontStack: "system",
            })}
            coolMode
          >
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </>
  );
}

export default MyApp;