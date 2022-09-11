import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor,HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend/index";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const[name, setName] = useState();
  const[owner, setOwner] = useState();
  const[image, setImage] = useState();
  const[button, setButton] = useState();
  const[priceInput, setpriceInput] = useState();
  const[loaderHidden, setloaderHidden] = useState(true);
  const[blur, setblur] = useState();
  const[sellStatus, setsellStatus] = useState("");
  const[priceLabel, setpriceLabel] = useState();
  const[shouldDisplay, setDisplay] = useState(true);

  const id = props.id;

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localHost}) ;
  // TODO: remove when delpoyed live
  agent.fetchRootKey()
  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"})
    );

    setName(name);
    setOwner(owner.toText());
    setImage(image);
    
    if(props.role == "collection") {
    const nftIsListed = await opend.isListed(props.id);

      if(nftIsListed) {
        setOwner("OpenD");
        setblur({filter : "blur(4px)"});
        setsellStatus(" Listed");
      } else{
        setButton(<Button handleClick={handleSell} text={"Sell"}/>);
      }
    } else if(props.role == "discover"){
      const originalOwener = await opend.getOrginalOwner(props.id);
      if (originalOwener.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }  

      const price = await opend.getListedNFTPrice(props.id);
      setpriceLabel(<PriceLabel sellPrice={price.toString()} />);
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;
  function handleSell() {
    console.log("clicked");
    setpriceInput(<input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => price=e.target.value}
      />
      );
      setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  async function sellItem() {
    setblur({filter : "blur(4px)"});
    setloaderHidden(false);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listing: " + listingResult);
    if(listingResult == "Success") {
       const openDId = await opend.getOpenDCanisterID();
       const transferResult = await NFTActor.transferOwnership(openDId,true);
       console.log("transfer:" + transferResult);
       if (transferResult == "Success") {
        setloaderHidden(true);
        setButton();
        setpriceInput();
        setOwner("OpenD");
        setsellStatus(" Listed");
       }
    }
  }

  async function handleBuy() {
    console.log("Buy was triggered");
    setloaderHidden(false);
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("txssk-maaaa-aaaaa-aaanq-cai"),
    })

    const sellerId = await opend.getOrginalOwner(props.id);
    const itemPrice = await opend.getListedNFTPrice(props.id);

    const result = await tokenActor.transfer(sellerId, itemPrice);
    if(result == "Success"){
      const transferResult = await opend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
      console.log("purchase: " + transferResult);
      setloaderHidden(true);
      setDisplay(false);
    }
  }


  return (
    <div style={{display: shouldDisplay ? "inline" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        </div>
        <div className="disCardContent-root">
         {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
