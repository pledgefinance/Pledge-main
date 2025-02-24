import React, { useEffect, useState } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Tabs, Table, Progress, Popover, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

import moment from 'moment';
import { FORMAT_TIME_STANDARD } from '_src/utils/constants';
import { DappLayout } from '_src/Layout';
import { Link } from 'react-router-dom';
import PageUrl from '_constants/pageURL';
import Web3 from 'web3';
import img1 from '_src/assets/images/4023 1.png';
import img2 from '_src/assets/images/4023 2.png';
import img3 from '_src/assets/images/4023 3.png';
import img4 from '_src/assets/images/4023 4.png';
import img5 from '_src/assets/images/4023 5.png';
import BTCB from '_src/assets/images/order_BTCB.png';
import BNB from '_src/assets/images/order_BNB.png';
import Lender1 from '_src/assets/images/Group 1843.png';
import Borrower from '_src/assets/images/Group 1842.png';
import Close from '_assets/images/Close Square.png';
import RootStore from '_src/stores/index';

import './index.less';
import Button from '_components/Button';
import { number } from 'echarts';
import services from '_src/services';
import { errors } from 'ethers';
import BigNumber from 'bignumber.js';
import { poll } from 'ethers/lib/utils';

function HomePage() {
  const history = useHistory();
  const { connector, library, chainId, account } = useWeb3React();
  const { testStore } = RootStore;
  const [pid, setpid] = useState(0);
  const { TabPane } = Tabs;
  const [tab, settab] = useState('Live');
  const [price, setprice] = useState(0);
  const [pool, setpool] = useState('BUSD');
  const [coin, setcoin] = useState('');
  const [visible, setvisible] = useState(false);
  const [show, setshow] = useState('100');
  const [data, setdata] = useState([]);
  const [datastate, setdatastate] = useState([]);
  const [BUSDprice, setBUSD] = useState('');
  const [BTCBprice, setBTCB] = useState('');

  const [DAIprice, setDAI] = useState('');

  const [BNBprice, setBNB] = useState('');
  const poolAsset = {
    '0xDc6dF65b2fA0322394a8af628Ad25Be7D7F413c2': 'BUSD',
    '0xF592aa48875a5FDE73Ba64B527477849C73787ad': 'BTCB',
    '0xf2bDB4ba16b7862A1bf0BE03CD5eE25147d7F096': 'DAI',
    '0x0000000000000000000000000000000000000000': 'BNB',
  };
  const imglist = {
    '0xF592aa48875a5FDE73Ba64B527477849C73787ad': BTCB,
    '0x0000000000000000000000000000000000000000': BNB,
  };
  const pricelist = {
    '0xDc6dF65b2fA0322394a8af628Ad25Be7D7F413c2': BUSDprice,
    '0xF592aa48875a5FDE73Ba64B527477849C73787ad': BTCBprice,
    '0xf2bDB4ba16b7862A1bf0BE03CD5eE25147d7F096': DAIprice,
    '0x0000000000000000000000000000000000000000': BNBprice,
  };
  const getPrice = () => {
    services.BscPledgeOracleServer.getPrice('0xf592aa48875a5fde73ba64b527477849c73787ad').then((res) => {
      setprice(Number(dealNumber_Price(res)));
    });
  };
  const dealNumber_18 = (num) => {
    if (num) {
      let x = new BigNumber(num);
      let y = new BigNumber(1e18);
      return Math.floor(Number(x.dividedBy(y)) * Math.pow(10, 7)) / Math.pow(10, 7);
    }
  };

  const dealNumber_8 = (num) => {
    if (num) {
      let x = new BigNumber(num);
      let y = new BigNumber(1e6);
      return x.dividedBy(y).toString();
    }
  };
  const dealNumber_Price = (num) => {
    if (num) {
      let x = new BigNumber(num);
      let y = new BigNumber(1e8);
      return x.dividedBy(y).toString();
    }
  };
  const getPoolInfo = async () => {
    const datainfo = await services.PoolServer.getPoolBaseData();
    const datainfo6 = await services.PoolServer.getPoolDataInfo();

    console.log(datainfo);
    const res = datainfo.map((item, index) => {
      let maxSupply = dealNumber_18(item.maxSupply);
      let borrowSupply = dealNumber_18(item.borrowSupply);
      let lendSupply = dealNumber_18(item.lendSupply);

      const times = moment.unix(item.settleTime).format(FORMAT_TIME_STANDARD);

      var difftime = item.endTime - item.settleTime;

      var days = parseInt(difftime / 86400 + '');
      return {
        key: index + 1,
        state: item.state,
        underlying_asset: poolAsset[item.borrowToken],
        fixed_rate: dealNumber_8(item.interestRate),
        maxSupply: maxSupply,
        available_to_lend: [borrowSupply, lendSupply],
        settlement_date: times,
        length: days,
        margin_ratio: dealNumber_8(item.autoLiquidateThreshold),
        collateralization_ratio: dealNumber_8(item.martgageRate),
        poolname: poolAsset[item.lendToken],
        endTime: item.endTime,
        settleTime: item.settleTime,
        logo: imglist[item.borrowToken],
        Sp: item.lendToken,
        Jp: item.borrowToken,
      };
    });
    setdata(res);
    setdatastate(
      res.filter((item) => {
        return item.state < 2;
      }),
    );
  };

  useEffect(() => {
    history.push('BUSD');
    getPoolInfo();
    getPrice();
    services.BscPledgeOracleServer.getPrices([
      '0xDc6dF65b2fA0322394a8af628Ad25Be7D7F413c2',
      '0xF592aa48875a5FDE73Ba64B527477849C73787ad',
      '0xf2bDB4ba16b7862A1bf0BE03CD5eE25147d7F096',
      '0x0000000000000000000000000000000000000000',
    ]).then((res) => {
      console.log(res);
      setBUSD(dealNumber_Price(res[0]));
      setBTCB(dealNumber_Price(res[1]));
      setDAI(dealNumber_Price(res[2]));
      setBNB(dealNumber_Price(res[3]));
    });
  }, []);

  const callback = (key) => {
    history.push(key);
    setpool(key);
  };
  const handleVisibleChange = (visable, num) => {
    if (visable) {
      setshow(num);
      setvisible(visable);
    }
  };
  const menu = (
    <Menu>
      <Menu.Item>
        <p
          className="menutab"
          onClick={() => {
            const livelist = data.filter((item) => {
              return item.state < 2;
            });
            settab('Live');
            setdatastate(data);
            setdatastate(livelist);
          }}
        >
          Live
        </p>
      </Menu.Item>
      <Menu.Item>
        <p
          className="menutab"
          onClick={() => {
            const livelist = data.filter((item) => {
              return item;
            });
            settab('All');
            setdatastate(data);
            setdatastate(livelist);
          }}
        >
          All
        </p>
      </Menu.Item>

      <Menu.Item>
        <p
          className="menutab"
          onClick={() => {
            const livelist = data.filter((item) => {
              return item.state >= 2;
            });
            settab('Finished');
            setdatastate(data);
            setdatastate(livelist);
          }}
        >
          Finished
        </p>
      </Menu.Item>
    </Menu>
  );
  //每三位加一个小数点
  function toThousands(num) {
    var num = (num || 0).toString(),
      result = '';
    while (num.length > 3) {
      result = ',' + num.slice(-3) + result;
      num = num.slice(0, num.length - 3);
    }
    if (num) {
      result = num + result;
    }
    return result;
  }

  const columns = [
    {
      title: 'Underlying Asset',
      dataIndex: 'underlying_asset',
      render: (val, record) => {
        return (
          <div className="underlyingAsset">
            <img src={record.logo} alt="" />
            <p>{val}</p>
          </div>
        );
      },
    },

    {
      title: 'Fixed Rate',
      dataIndex: 'fixed_rate',
      sorter: {
        compare: (a, b) => a.fixed_rate - b.fixed_rate,
        multiple: 3,
      },
      render: (val, record) => {
        return <div>{`${val}%`}</div>;
      },
    },
    {
      title: 'Available To Lend',
      dataIndex: 'available_to_lend',
      render: (val, record) => {
        var totalFinancing = (val[1] / record.maxSupply) * 100;
        return (
          <div className="totalFinancing">
            <Progress
              percent={totalFinancing}
              showInfo={false}
              strokeColor="#5D52FF"
              success={{
                percent:
                  Math.floor(
                    ((val[0] * pricelist[record.Jp]) / pricelist[record.Sp] / record.collateralization_ratio) * 10000,
                  ) /
                  100 /
                  record.maxSupply,
              }}
            />

            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <span style={{ color: '#FFA011', fontSize: '12px' }}>
                  {Math.floor(
                    ((val[0] * pricelist[record.Jp]) / pricelist[record.Sp] / record.collateralization_ratio) * 10000,
                  ) / 100}
                </span>
                /<span style={{ color: '#5D52FF', fontSize: '12px' }}>{`${toThousands(val[1])}`}</span>
              </span>
              <span style={{ width: '10px' }}></span>
              <span style={{ fontSize: '12px' }}>{toThousands(record.maxSupply)}</span>
            </p>
          </div>
        );
      },
      sorter: {
        compare: (a, b) => a.total_financing - b.total_financing,
        multiple: 2,
      },
    },
    {
      title: 'Settlement Date',
      dataIndex: 'settlement_date',
      sorter: {
        compare: (a, b) => a.settleTime - b.settleTime,
        multiple: 1,
      },
    },
    {
      title: 'Length',
      dataIndex: 'length',
      sorter: {
        compare: (a, b) => a.length - b.length,
        multiple: 5,
      },
      render: (val, record) => {
        return <div>{`${val} day`}</div>;
      },
    },
    {
      title: 'Margin Ratio',
      dataIndex: 'margin_ratio',
      sorter: {
        compare: (a, b) => a.margin_ratio - b.margin_ratio,
        multiple: 6,
      },
      render: (val, record) => {
        return `${Number(val) + 100}%`;
      },
    },
    {
      title: 'Collateralization Ratio',
      dataIndex: 'collateralization_ratio',
      render: (val, record) => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {`${val}%`}
            <Popover
              content={content}
              title="Choose a Role"
              trigger="click"
              visible={show === record.key && visible}
              onVisibleChange={(e) => handleVisibleChange(e, record.key)}
            >
              <Button
                style={{ width: '107px', height: '40px', borderRadius: '15px', lineHeight: '40px', color: '#FFF' }}
                onClick={() => {
                  setcoin(record.underlying_asset);
                  setshow(record.key);
                  setpid(record.key - 1);
                }}
              >
                Detail
              </Button>
            </Popover>
          </div>
        );
      },
      sorter: {
        compare: (a, b) => a.collateralization_ratio - b.collateralization_ratio,
        multiple: 7,
      },
    },
  ];
  const columns1 = [
    {
      title: 'Underlying Asset',
      dataIndex: 'underlying_asset',
      render: (val, record) => {
        return (
          <Popover
            content={content}
            title="Choose a Role"
            trigger="click"
            visible={show === record.key && visible}
            onVisibleChange={(e) => handleVisibleChange(e, record.key)}
          >
            <div
              className="underlyingAsset"
              onClick={() => {
                Changecoin(val), setcoin(record.underlying_asset);
                setshow(record.key);
                setpid(record.key - 1);
              }}
            >
              <img src={record.logo} alt="" />
              <p>{val}</p>
            </div>
          </Popover>
        );
      },
    },

    {
      title: 'Fixed Rate',
      dataIndex: 'fixed_rate',
      sorter: {
        compare: (a, b) => a.fixed_rate - b.fixed_rate,
        multiple: 3,
      },
      render: (val, record) => {
        return <div>{`${val}%`}</div>;
      },
    },

    {
      title: 'Settlement Date',
      dataIndex: 'settlement_date',
      sorter: {
        compare: (a, b) => a.settlement_date - b.settlement_date,
        multiple: 1,
      },
    },
  ];

  function onChange(pagination, filters, sorter, extra) {
    console.log('params', pagination, filters, sorter, extra);
  }
  const Changecoin = (val) => {
    setcoin(val);
  };

  const content = (
    <div className="choose">
      <div className="choose_lender">
        <img src={Lender1} alt="" />
        <Link
          to={PageUrl.Market_Pool.replace(':pid/:pool/:coin/:mode', `${pid}/${pool}/${coin}/Lender`)}
          style={{ color: '#FFF' }}
        >
          <span>Lender</span> <span> Lock in a fixed interest rate today. Fixed rates guarantee your APY.</span>
        </Link>
      </div>
      <div className="choose_borrow">
        <img src={Borrower} alt="" />
        <Link
          to={PageUrl.Market_Pool.replace(':pid/:pool/:coin/:mode', `${pid}/${pool}/${coin}/Borrower`)}
          style={{ color: '#FFF' }}
        >
          <span>Borrower</span> <span>Borrow with certainty. Fixed rates lock in what you pay.</span>
        </Link>
      </div>
      <img
        src={Close}
        alt=""
        className="close"
        onClick={() => {
          setvisible(false);
          setshow('100');
        }}
      />
    </div>
  );
  return (
    <div className="dapp_home_page">
      <DappLayout title="Market Pool" className="trust_code">
        <Dropdown overlay={menu} trigger={['click']} className="dropdown">
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            {tab}
            <DownOutlined />
          </a>
        </Dropdown>
        <Tabs defaultActiveKey="1" onChange={callback} className="all_tab">
          <TabPane tab="BUSD" key="BUSD">
            <Table
              columns={columns}
              dataSource={datastate.filter((item, index) => {
                return item.Sp == '0xDc6dF65b2fA0322394a8af628Ad25Be7D7F413c2';
              })}
              onChange={onChange}
              rowClassName={(record, index) => {
                return record;
              }}
            />
          </TabPane>
          <TabPane tab="USDT" key="USDT">
            <Table
              columns={columns}
              dataSource={datastate.filter((item, index) => {
                return item.Sp == '';
              })}
              onChange={onChange}
              rowClassName={(record, index) => {
                return record;
              }}
            />
          </TabPane>
          <TabPane tab="DAI" key="DAI">
            <Table
              columns={columns}
              dataSource={datastate.filter((item, index) => {
                return item.Sp == '0xf2bDB4ba16b7862A1bf0BE03CD5eE25147d7F096';
              })}
              onChange={onChange}
              rowClassName={(record, index) => {
                return record;
              }}
            />
          </TabPane>
        </Tabs>
        <Tabs defaultActiveKey="1" onChange={callback} className="media_tab">
          <TabPane tab="BUSD" key="BUSD">
            <Table
              columns={columns1}
              dataSource={data.filter((item, index) => {
                return item.Sp == '0xDc6dF65b2fA0322394a8af628Ad25Be7D7F413c2';
              })}
              onChange={onChange}
              rowClassName={(record, index) => {
                return record;
              }}
            />
          </TabPane>
          <TabPane tab="USDT" key="USDT">
            <Table
              columns={columns1}
              dataSource={data.filter((item, index) => {
                return item.Sp == '';
              })}
              onChange={onChange}
              rowClassName={(record, index) => {
                return record;
              }}
            />
          </TabPane>
          <TabPane tab="DAI" key="DAI">
            <Table
              columns={columns1}
              dataSource={data.filter((item, index) => {
                return item.Sp == '0xf2bDB4ba16b7862A1bf0BE03CD5eE25147d7F096';
              })}
              onChange={onChange}
              rowClassName={(record, index) => {
                return record;
              }}
            />
          </TabPane>
        </Tabs>
      </DappLayout>
    </div>
  );
}
export default HomePage;
