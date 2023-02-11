import { React, useState, useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";
import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import { useAccount } from "wagmi";
import { ConnectBtn } from "../components/custombutton";
import { useRef } from "react";
import Marquee from "react-fast-marquee";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import abi from "../contract/abi.json";
import {
  Flex,
  Text,
  Button,
  Spinner,
  Divider,
  Image,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

import { TwitterShareButton } from "next-share";

import BannerToast from "../components/banner";
import { add } from "lodash";

function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const breakpoints = {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
    "2xl": "96em",
  };

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const btnRef2 = useRef();
  const btnRef = useRef();
  const [txnHash, setTxnHash] = useState("");
  const { address, isConnected } = useAccount();
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [genipfs, setGenipfs] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [userUploadedImage, setUserUploadedImage] = useState(null);
  const flag = true;
  const [copyLink, setCopyLink] = useState("");
  const notInitialRender = useRef(false);
  const [auth, setAuth] = useState();
  const [ipfs, setIpfs] = useState();
  const [txn, setTxn] = useState();

  useEffect(() => {
    // address != "" ? setAuth(true) : setAuth(false)
    setAuth(isConnected);
  }, []);

  const [state, newBanner] = BannerToast();

  const getOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "6ba2e79e-a032-451e-ace7-7494384322b7",
    },
  };

  const contractAddress = "0xf8C3AE818a4eb7a0c476E5A1AF3277A582335468";

  const contractABI = abi.abi;

  const mint = async (IPFS) => {
    flag = false;
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const MintContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let safemint = await MintContract.safeMint(address, ipfs);
        console.log("NFT MINTED🎉");
        console.log(
          `https://explorer.testnet.mantle.xyz/tx/${safemint["hash"]}`
        );
        setTxn(`https://explorer.testnet.mantle.xyz/tx/${safemint["hash"]}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }

    setMinted(true);
    flag = true;

    if (flag) {
      newBanner({ message: "NFT Minted", status: "success" });
    } else {
      newBanner({ message: "Please try again later", status: "error" });
    }

    if (!isConnected) {
      newBanner({ message: "Please try again later", status: "error" });
    }
  };

  const IPFS = async () => {
    setMinting(true);
    const form = new FormData();

    console.log(predictions[predictions.length - 1].output[0]);

    const link = predictions[predictions.length - 1].output[0];

    const postOptions = {
      method: "POST",

      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAxMWE2NDdGOTBBMTVhODc2Y0Q2RDQ0Y2JDRDExRjY1MTJBNDQxZGQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3NjAzNTM4Njk0MCwibmFtZSI6InRlc3QifQ.3yjM7FK6FMBCAsIISpufoswsqcspWamPMM3xSd2_Lmw",
        "Content-Type": "image/*",
      },

      body: `{"chain":"mantle","name":"AI MINT","description":\"Prompt: ${desc}\","image":\"${link}\","mint_to_address":"${address}"}`,
    };

    await fetch("https://api.nft.storage/upload", postOptions)
      .then((response) => response.json())
      .then((response) => {
        // Handle the response
        console.log(`https://ipfs.io/ipfs/${response["value"]["cid"]}`);
        setIpfs(`https://ipfs.io/ipfs/${response["value"]["cid"]}`);
        setGenipfs(true);
      })

      // .then((response) => console.log(response))
      .catch((err) => {
        console.error(err);
        flag = false;
      });

    setMinting(false);
    if (flag) {
      newBanner({ message: "IPFS Deployed", status: "success" });
    } else {
      newBanner({ message: "Please try again later", status: "error" });
    }

    if (!isConnected) {
      newBanner({ message: "Please try again later", status: "error" });
    }
  };

  const handleSubmit = async (e) => {
    setDesc(e.target.prompt.value);
    e.preventDefault();

    const prevPrediction = predictions[predictions.length - 1];
    const prevPredictionOutput = prevPrediction?.output
      ? prevPrediction.output[prevPrediction.output.length - 1]
      : null;

    const body = {
      prompt: `mdjrny-v4 style ${e.target.prompt.value}`,
      init_image: userUploadedImage
        ? await readAsDataURL(userUploadedImage)
        : // only use previous prediction as init image if there's a mask
        maskImage
        ? prevPredictionOutput
        : null,
      mask: maskImage,
    };

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const prediction = await response.json();

    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPredictions(predictions.concat([prediction]));

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      setPredictions(predictions.concat([prediction]));

      if (prediction.status === "succeeded") {
        setUserUploadedImage(null);
      }
    }

    setGenerated(true);
  };

  const myRef = useRef(null);

  const executeScroll = () => myRef.current.scrollIntoView();
  return (
    <>
      <Flex
        fontFamily={"IBM Plex Mono, monospace"}
        width="100%"
        height={{ base: "1573px", lg: "1612px" }}
        background={"white"}
        align={"center"}
        flexDir={"column"}
      >
        <Flex bg={"black"} color={"white"} width={"100%"} userSelect="none">
          <Flex paddingTop={"10px"} paddingBottom={"10px"}>
            <Text>
              <Marquee gradientColor={"[0, 0, 0]"}>
                Mantle Testnet Version Mantle Testnet Version Mantle Testnet
                Version Mantle Testnet Version Mantle Testnet Version Mantle
                Testnet Version Mantle Testnet Version Mantle Testnet Version
                Mantle Testnet Version Mantle Testnet Version Mantle Testnet
                Version Mantle Testnet Version
              </Marquee>
            </Text>
          </Flex>
        </Flex>
        <Flex gap={{ base: "184px", md: "776px" }} marginTop={"30px"}>
          <Flex gap={"12px"} align={"center"} height={"26px"}>
            <Image src={"aimint_logo.svg"} height={"24px"} width={"24px"} />
            <Text fontSize={{ base: "20px", lg: "20px" }}>AI Mint</Text>
          </Flex>
          <Flex gap={"32px"} display={{ base: "none", lg: "flex" }}>
            <div className="hover-underline-animation">
              <Text fontSize={{ base: "11px", lg: "20px" }} cursor={"pointer"}>
                Home
              </Text>
            </div>
            <div className="hover-underline-animation">
              <Text
                fontSize={{ base: "11px", lg: "20px" }}
                onClick={executeScroll}
                cursor={"pointer"}
              >
                <a href="https://twitter.com/aimintHQ">Twitter</a>
              </Text>
            </div>
            <div className="hover-underline-animation">
              <Text
                fontSize={{ base: "11px", lg: "20px" }}
                onClick={executeScroll}
                cursor={"pointer"}
              >
                About
              </Text>
            </div>
          </Flex>
          <Flex
            display={{ base: "flex", lg: "none" }}
            ref={btnRef}
            onClick={onOpen}
          >
            <Image src={"menu.svg"} height={"24px"} width={"24px"} />
          </Flex>
        </Flex>

        <Flex
          flexDir={"column"}
          width={{ base: "360px", lg: "584px" }}
          marginTop={"16px"}
          align={"center"}
        >
          <Flex
            flexDir={"column"}
            width={{ base: "328px", lg: "428px" }}
            gap={"7px"}
            marginTop={"27px"}
          >
            <Text fontSize={{ base: "18px", lg: "26px" }} fontWeight={"500"}>
              <u>AI Mint</u> — Bringing generative art to your digital wallets.
            </Text>

            <Text fontSize={"12px"} fontStyle={"italic"}>
              by <a href={"https://www.ahzam.xyz/"}>ahzam</a> &{" "}
              <a href={"https://twitter.com/AayushCodes"}>aayush</a> //
            </Text>
          </Flex>

          <Flex flexDir={"column"} marginTop={"21px"} gap={"16px"}>
            <Flex
              height={{ base: "328px", lg: "428px" }}
              width={{ base: "328px", lg: "428px" }}
              borderRadius={"4px"}
              border={"1px solid black"}
              borderStyle={"dashed"}
            >
              <Canvas predictions={predictions} />
            </Flex>

            <PromptForm onSubmit={handleSubmit} />

            <Flex gap={"8px"}>
              {!(generated && isConnected) ? (
                <Button
                  cursor={"not-allowed"}
                  opacity={"60%"}
                  background={"rgba(0, 0, 0, 0.05)"}
                  height={"38px"}
                  width={{ base: "160px", lg: "210px" }}
                  borderRadius={"4px"}
                  border={"1px solid black"}
                  borderStyle={"dashed"}
                  _hover={{ background: "rgba(0, 0, 0, 0.1)" }}
                  _active={{ background: "" }}
                >
                  Deploy on IPFS
                </Button>
              ) : (
                <Button
                  onClick={IPFS}
                  disabled={minting}
                  type={"submit"}
                  background={"rgba(0, 0, 0, 0.05)"}
                  height={"38px"}
                  width={{ base: "160px", lg: "210px" }}
                  borderRadius={"4px"}
                  border={"1px solid black"}
                  borderStyle={"dashed"}
                  _hover={{ background: "rgba(0, 0, 0, 0.1)" }}
                  _active={{ background: "" }}
                >
                  {!minting ? <Text> Deploy on IPFS </Text> : <Spinner />}
                </Button>
              )}

              {!genipfs ? (
                <Button
                  cursor={"not-allowed"}
                  opacity={"60%"}
                  background={"rgba(0, 0, 0, 0.05)"}
                  height={"38px"}
                  width={{ base: "160px", lg: "210px" }}
                  borderRadius={"4px"}
                  border={"1px solid black"}
                  borderStyle={"dashed"}
                  _hover={{ background: "rgba(0, 0, 0, 0.1)" }}
                  _active={{ background: "" }}
                >
                  Mint NFT
                </Button>
              ) : (
                <Button
                  onClick={mint}
                  disabled={minting}
                  type={"submit"}
                  background={"rgba(0, 0, 0, 0.05)"}
                  height={"38px"}
                  width={{ base: "160px", lg: "210px" }}
                  borderRadius={"4px"}
                  border={"1px solid black"}
                  borderStyle={"dashed"}
                  _hover={{ background: "rgba(0, 0, 0, 0.1)" }}
                  _active={{ background: "" }}
                >
                  {!minting ? <Text> Mint NFT </Text> : <Spinner />}
                </Button>
              )}
            </Flex>

            <Flex>
              {minted ? (
                <Flex gap={"16px"} align={"center"}>
                  <Text
                    fontStyle={"italic"}
                    fontSize={"14px"}
                    fontWeight={"bold"}
                    _hover={{ textDecor: "underline" }}
                  >
                    <a href={ipfs}>IPFS ↗</a>
                  </Text>
                  <Text
                    fontStyle={"italic"}
                    fontSize={"14px"}
                    fontWeight={"bold"}
                    _hover={{ textDecor: "underline" }}
                  >
                    <a href={txn}>Transaction ↗</a>
                  </Text>
                </Flex>
              ) : (
                <></>
              )}
            </Flex>
          </Flex>

          <Flex width={{ base: "360px", md: "360px", lg: "584px" }}>
            <Divider
              marginTop={"92px"}
              width={{ base: "360px", md: "360px", lg: "584px" }}
              borderColor={"black"}
            />
          </Flex>

          <Flex
            flexDir={"column"}
            gap={"49px"}
            width={{ base: "300px", lg: "360px" }}
            marginTop={"92px"}
            ref={myRef}
          >
            <Flex flexDir={"column"} gap={"22px"}>
              <Text
                fontWeight={"500"}
                fontSize={"20px"}
                textDecor={"underline"}
              >
                About
              </Text>
              <Text fontStyle={"italic"} fontSize={"14px"}>
                we let you type your creativity and generate it as an art using
                the latest stable diffusion model and then let you mint it as a
                gasless NFT on the mantle (testnet) chain.
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.readAsDataURL(file);
  });
}
