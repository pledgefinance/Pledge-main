import React from 'react';
import classnames from 'classnames';

import BUSD from '_src/assets/images/order_BUSD.png';
import BTCB from '_src/assets/images/order_BTCB.png';
import USDT from '_src/assets/images/order_USDT.png';

import './index.less';

export interface IOrderImg {
  img1: string;
  img2: string;
  className?: string;
  style?: React.CSSProperties;
}

const OrderImg: React.FC<IOrderImg> = ({ className, style, img1, img2 }) => {
  const imglist = {
    BUSD: BUSD,
    BTCB: BTCB,
    USDT: USDT,
  };
  return (
    <div className={classnames('components_order_img')} style={style}>
      <img src={imglist[img1]} alt="" className="img1" />
      <img src={imglist[img2]} alt="" className="img2" />
    </div>
  );
};

OrderImg.defaultProps = {
  className: '',
  style: null,
  img1: '',
  img2: '',
};

export default OrderImg;
