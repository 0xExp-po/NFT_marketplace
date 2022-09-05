import React, { useEffect, useState } from "react";
import { propTypes } from "../../../../node_modules/react-bootstrap/esm/Image";
import Item from "./Item";
import { Principal } from "@dfinity/principal";

function Gallery(props) {

  const [items, setItems] = useState();

  function fetchNFTs() {
    if (props.ids != undefined) {
      setItems(
        props.ids.map( (NFTID) => (
          <Item id={NFTID} key={NFTID.toText()} role={props.role} />
        ) )
      )
    }
  }

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
          {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
