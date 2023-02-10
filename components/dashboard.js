import { useState, useEffect } from "react";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAccount } from "wagmi";
import {
  Flex,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

export default function Dashboard({ open, close, refr }) {
  const { address, isConnected } = useAccount();
  const [resp, setResp] = useState([]);
  const [isImageReady, setIsImageReady] = useState(false);

  const onLoadCallBack = async (e) => {
    setIsImageReady(true);
    typeof onLoad === "function" && onLoad(e);
  };

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "fb30cff8-1a59-4fe6-8832-5c8d7cc40d5d",
    },
  };

  useEffect(() => {
    try {
      if (isConnected) {
        fetch(
          `https://api.nftport.xyz/v0/accounts/${address}?chain=polygon&page_size=50&include=metadata&contract_address=0x6fdfe7feec201a840bd4709bbb8e0d2aa0a1ae53`,
          options
        )
          .then((response) => response.json())
          .then((response) => {
            // console.log(response.nfts);
            setResp(response.nfts);
          })
          .catch((err) => console.error(err));
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div className="main" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
      {isConnected ? (
        <Drawer
          isOpen={open}
          placement="right"
          onClose={close}
          finalFocusRef={refr}
          size={"xl"}
          fontFamily={"IBM Plex Mono, monospace"}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton _active={{}} />

            <DrawerBody marginTop={"40px"}>
              <Flex
                justify={"center"}
                flexWrap="wrap"
                gap={"17px"}
                fontFamily={"IBM Plex Mono, monospace"}
              >
                {resp.map((item) => {
                  return (
                    <div className="lg:w-[400px] w-[300px]" key={item.token_id}>
                      <div>
                        {!isImageReady ? (
                          <Skeleton
                            inline="true"
                            height={"400px"}
                            width={"400px"}
                            borderRadius={"7px"}
                          />
                        ) : (
                          <></>
                        )}
                        {item.file_url && (
                          <>
                            <Image
                              display={"none"}
                              placeholder="blur"
                              blurDataURL="base64"
                              width={400}
                              height={400}
                              src={item.file_url}
                              alt="NFT Image"
                              className="rounded-[7px]"
                              onLoad={onLoadCallBack}
                            />
                          </>
                        )}
                      </div>
                      <div>
                        <div className="text-[18px] font-bold text-left">
                          Token ID: {item.token_id}
                        </div>
                        <div className="text-[14px] lg:w-[400px] w-[300px] text-left">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ) : (
        <></>
      )}
    </div>
  );
}
