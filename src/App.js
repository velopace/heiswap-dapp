// @flow

import React, { useState, useEffect } from 'react'
import getWeb3 from './utils/getWeb3'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import createDrizzleUtils from '@drizzle-utils/core'
import Web3StatusModal from './components/Web3StatusModal'
import Logo from './assets/key.png'
import NotFoundPage from './components/404NotFound'
import FAQPage from './components/FAQPage'
import DepositPage from './components/DepositPage'
import WithdrawPage from './components/WithdrawPage'
import StatusPage from './components/StatusPage'
import {
  Heading,
  Text,
  Input,
  Flex,
  Box,
  Button,
  Blockie,
  QR,
  ThemeProvider
} from 'rimble-ui'

type DappGateway = {
  web3: Object,
  drizzleUtils: Object,
  ethAddress: String, // Current ETH Address
  attempted: Boolean // Have we attempted to connect to web3 and drizzleUtils?
}

type TabState = {
  index: number
}

const HeiSwapApp = () => {
  // Dapp gateway state
  const [dappGateway: DappGateway, setDappGateway] = useState({
    web3: null,
    drizzleUtils: null,
    ethAddress: null,
    attempted: false
  })

  // Status Modal
  const [web3StatusModal: Boolean, setweb3StatusModal] = useState(false)

  // "Tabs" (made with buttons)
  const [curTab: TabState, setCurTab] = useState({
    index: 0
  })

  // Helper function to initialize web3, drizzleUtils, and the ETH accounts
  const initDappGateway = async (): Boolean => {
    try {
      const web3 = await getWeb3()
      const drizzleUtils = await createDrizzleUtils({ web3 })
      const accounts = await drizzleUtils.getAccounts()

      setDappGateway({
        web3,
        drizzleUtils,
        ethAddress: accounts[0],
        attempted: true
      })

      return true
    } catch (err) {
      return false
    }
  }

  // On page load, grab web3 and drizzle utils and contract
  // definitions, as props, and inject them into the browser
  useEffect(() => {
    if (
      (dappGateway.web3 === null || dappGateway.drizzleUtils === null) &&
      !dappGateway.attempted
    ) {
      (async () => {
        await initDappGateway()
      })()
    }
  })

  return (
    <ThemeProvider>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <div style={{ paddingBottom: '3.5rem' }}>
          <Flex>
            <Box p={3} width={1} style={{ textAlign: 'right' }}>
              {dappGateway.ethAddress === null ? (
                <Button size='small' style={{ marginTop: '10px' }}
                  onClick={() => {
                    if (dappGateway.ethAddress === null) {
                      (async () => {
                        if (!await initDappGateway()) {
                          setweb3StatusModal(true)
                        }
                      })()
                    }
                  }}
                >
                  Connect
                </Button>
              ) : (
                <Button.Outline size='small' style={{ marginTop: '10px' }}
                  onClick={() => setweb3StatusModal(true)}
                >
                  <Blockie opts={{ seed: dappGateway.ethAddress, size: 4 }} />
                    &nbsp;&nbsp;
                  {dappGateway.ethAddress.slice(0, 5) + '...' + dappGateway.ethAddress.slice(-4)}
                </Button.Outline>
              )}
            </Box>
          </Flex>

          <Flex>
            <Box m={'auto'} width={[1, 1 / 2]}>
              <div style={{ margin: '0 20px 0 20px' }}>
                <Button.Text>
                  <img alt='logo' src={Logo} style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                    Heiswap
                </Button.Text>
                <div style={{ float: 'right' }}>
                  <Link to='/faq'>
                    <Button.Text>
                      Help & FAQ
                    </Button.Text>
                  </Link>
                </div>
              </div>
              <Flex
                px={4}
                py={3}
                borderTop={1}
                borderBottom={1}
                borderColor={'#E8E8E8'}
                justifyContent={'space-between'}
              >
                { curTab.index === 0
                  ? <Button>Deposit</Button>
                  : <Button.Outline onClick={() => setCurTab({ index: 0 })}>Deposit</Button.Outline>
                }
                { curTab.index === 1
                  ? <Button>Withdraw</Button>
                  : <Button.Outline onClick={() => setCurTab({ index: 1 })}>Withdraw</Button.Outline>
                }
                { curTab.index === 2
                  ? <Button>Status</Button>
                  : <Button.Outline onClick={() => setCurTab({ index: 2 })}>Status</Button.Outline>
                }
              </Flex>

              <Flex
                px={4}
                py={3}
                justifyContent={'stretch'}
              >
                {
                  (curTab.index === 0) ? <DepositPage />
                    : (curTab.index === 1) ? <WithdrawPage />
                      : (curTab.index === 2) ? <StatusPage />
                        : <div>Invalid Page</div>
                }
              </Flex>
            </Box>
          </Flex>

          <Web3StatusModal isOpen={web3StatusModal} setIsOpen={setweb3StatusModal}>
            {
              dappGateway.ethAddress === null
                ? (
                  <div>
                    <Heading.h3>No Ethereum account found</Heading.h3>
                    <br />
                    <Text>
                      Please visit this page in a Web3 enabled browser.{' '}
                      <a href='https://ethereum.org/use/#_3-what-is-a-wallet-and-which-one-should-i-use'>
                        Learn more
                      </a>
                    </Text>
                  </div>
                )
                : (
                  <div style={{ textAlign: 'center' }}>
                    <Heading.h3>Connected Ethereum account</Heading.h3>
                    <br />
                    <Text style={{ textAlign: 'center' }}>
                      <QR value={dappGateway.ethAddress} />
                      <br /><br />
                      <Input
                        style={{ textAlign: 'center' }}
                        width='100%'
                        type='text' onChange={() => { }} value={dappGateway.ethAddress}
                      />
                    </Text>
                  </div>
                )
            }
          </Web3StatusModal>
        </div>

        <div style={{ position: 'absolute', bottom: '0', width: '100%', height: '3.5rem', borderTop: '1px solid #E8E8E8' }}>
          <Text style={{ textAlign: 'center', paddingTop: '1rem' }}>
            Built by&nbsp;<a href='https://kndrck.co'>Kendrick Tan</a>&nbsp;|&nbsp;<a href='https://github.com/kendricktan/heiswap-dapp'>Source code</a>
          </Text>
        </div>
      </div>
    </ThemeProvider>
  )
}

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={HeiSwapApp} />
        <Route exact path='/faq' component={FAQPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Router>
  )
}

export default App
