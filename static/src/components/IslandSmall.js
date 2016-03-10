import React from 'react';
import Constants from '../Constants';

let islands = {
  1: Constants.Image.ISLAND_SMALL_1,
  2: Constants.Image.ISLAND_SMALL_2,
  3: Constants.Image.ISLAND_SMALL_3,
  4: Constants.Image.ISLAND_SMALL_4,
  5: Constants.Image.ISLAND_SMALL_5,
  6: Constants.Image.ISLAND_SMALL_6,
}

export default ({type, number}) => {
  let className = `island small-island small-${number}`;
  return <img className={className} src={islands[type]} />
}