import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router'
import { web3, contract, useAuth, _, provider } from './../contexts/AuthContext'
import party from 'party-js'
import ABI from './../abi/giftmoji.json'
import toast, { Toaster } from 'react-hot-toast'
import Icon from './helper/MaterialIcon'
import Loading from './components/LoadingSpinner'
import AssetVideo from './../assets/asset1.webm'
import Web3 from 'web3'
import Logo from './../../public/logo.svg'
import styles from './Home.module.scss'

const web3ReadOnly = new Web3(import.meta.env.VITE_LUKSO_PROVIDER)
const contractReadOnly = new web3ReadOnly.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

function Home() {
  const [status, setStatus] = useState('')
  const [data, setData] = useState()
  const [lsp7list, setLsp7list] = useState([])
  let [searchParams] = useSearchParams()

  async function get_lsp7(contract) {
    console.log(contract)
    let myHeaders = new Headers()
    myHeaders.append('Content-Type', `application/json`)
    myHeaders.append('Accept', `application/json`)

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        query: `query MyQuery {
  Asset(where: {id: {_eq: "${contract}"}}) {
    id
    isLSP7
    lsp4TokenName
    lsp4TokenSymbol
    lsp4TokenType
    name
    totalSupply
    owner_id
    icons {
      id
      src
      url
    }
    transfers(order_by: {blockNumber: desc}, limit: 5) {
      value
      transaction_id
      from {
        id
        fullName
        profileImages {
          src
        }
        isEOA
      }
      to {
        id
        fullName
        profileImages {
          src
        }
        isEOA
      }
    }
    holders(order_by: {balance: desc}, limit: 100) {
      balance
      profile {
        name
        fullName
        id
        isEOA
        isContract
        profileImages {
          src
        }
        tags
      }
    }
  }
}`,
      }),
    }

    const response = await fetch(`${import.meta.env.VITE_LUKSO_API_ENDPOINT}`, requestOptions)
    if (!response.ok) {
      return { result: false, message: `Failed to fetch query` }
    }
    const data = await response.json()
    return data
  }

  async function searchLSP7(e) {
    const q = e.target.value

    setStatus(`searching`)

    let myHeaders = new Headers()
    myHeaders.append('Content-Type', `application/json`)
    myHeaders.append('Accept', `application/json`)

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        query: `query MyQuery {
  Asset(
    where: {lsp4TokenName: {_ilike: "%${q}%"}, isLSP7: {_eq: true}}
    limit: 15
    order_by: {holders_aggregate: {count: desc}}
  ) {
    id
    isLSP7
    lsp4TokenName
    lsp4TokenSymbol
    lsp4TokenType
    name
    totalSupply
    owner_id
    holders_aggregate {
      aggregate {
        count
      }
    }
  }
}`,
      }),
    }

    const response = await fetch(`${import.meta.env.VITE_LUKSO_API_ENDPOINT}`, requestOptions)
    if (!response.ok) {
      return { result: false, message: `Failed to fetch query` }
    }
    const data = await response.json()
    setStatus(``)
    // console.log(data)
    if (data.data.Asset.length > 0) setLsp7list(data.data.Asset)
  }

  useEffect(() => {
    if (searchParams.get(`asset`)) {
      get_lsp7(searchParams.get(`asset`)).then((res) => {
        // console.log(res)
        setData(res)
      })
    }

    if (searchParams.get(`theme`)) {
      document.querySelector(`:root`).style.setProperty('--theme', `${searchParams.get(`theme`)}`)
      document.querySelector(`:root`).style.setProperty('--scrollbarBG', `${searchParams.get(`theme`)}`)
    }
  }, [])

  return (
    <div className={`${styles.page} page __container`} data-width={`large`}>
      <Toaster />
      <header className={`${styles.header} d-flex flex-column align-items-center justify-content-between`}>
        <figure className={`ms-motion-slideDownIn`}>
          <img className={`Logo`} src={Logo} alt={`${import.meta.env.VITE_NAME}`} width={220} height={48} />
        </figure>
        <h2 className={`text-capitalize`}>{import.meta.env.VITE_NAME}</h2>
        <b>{import.meta.env.VITE_SLOGAN}</b>
      </header>

      <main className={`${styles.main}`}>
        {!data && (
          <div className={`__container`} data-width={`small`}>
            <form action="" method={`get`} className={`form`}>
              <div className={`form-group`}>
                <div style={{ height: `24px` }}>{status === `searching` && <Loading />}</div>
                <input list={`tokens`} className={`w-100`} type="text" name={`asset`} placeholder={`Search token`} onKeyPress={(e) => searchLSP7(e)} />
                <datalist id="tokens">
                  {lsp7list.length > 0 &&
                    lsp7list.map((item, i) => {
                      return (
                        <option key={i} value={`${item.id}`}>
                          {item.lsp4TokenName} (${item.lsp4TokenSymbol})
                        </option>
                      )
                    })}
                </datalist>
              </div>
              <div className={`form-group`}>
                <label htmlFor="">Theme:</label>
                <input className={`w-100`} type={`color`} name={`theme`} defaultValue={`#f8fafb`} />
              </div>
              <div className={`form-group`}>
                <button className={`w-100 btn`}>Search</button>
              </div>
            </form>
          </div>
        )}
        {data && (
          <>
            <div className={`card border border--danger`}>
              <div className={`card__body d-flex flex-row align-items-center justify-content-between`} style={{ background: `var(--red-050)` }}>
                <div className={`d-flex flex-column`}>
                  <p>
                    <span>Symbol:</span> ${data.data.Asset[0].lsp4TokenSymbol}
                  </p>
                  <p>
                    <span>Total Supply:</span> {new Intl.NumberFormat().format(_.fromWei(data.data.Asset[0].totalSupply, `ether`))}
                  </p>
                  <p>
                    <span>LSP7:</span> {data.data.Asset[0].isLSP7 ? `Yes` : `No`}
                  </p>
                  <p>
                    <span>Contract:</span>{' '}
                    <a target={`_blank`} href={`https://explorer.execution.mainnet.lukso.network/address/${data.data.Asset[0].id}`}>
                      View on explorer
                    </a>
                  </p>
                  <a style={{ color: 'var(--LUKSO)', textUnderlineOffset: `4px` }} className={`mt-10 text-underline d-flex align-items-center`} href={`https://universalswaps.io/tokens/lukso/${data.data.Asset[0].id}`}>
                    <b>Trade now</b>
                  </a>
                </div>

                <figure>
                  <img className={`rounded ms-depth-16`} style={{ width: `128px`, height: `128px` }} alt={`Icon`} src={data.data.Asset[0].icons[0].src} />
                </figure>
              </div>
            </div>

            <div className={`card mt-10`}>
              <div className={`card__header`}>The last five transactions</div>
              <div className={`card__body`}>
                <table>
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Value</th>
                      <th>TX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.Asset[0].transfers.map((item, i) => {
                      console.log(item)
                      return (
                        <tr key={i}>
                          <td className={`d-flex align-items-center grid--gap-025`}>
                            {i + 1 == 1 ? `1️⃣` : i + 1 == 2 ? `2️⃣` : i + 1 == 3 ? `3️⃣` : i + 1 == 4 ? `4️⃣` : i + 1 == 5 ? `5️⃣` : ''}
                            {item.from.profileImages.length > 0 ? (
                              <a key={i} target={`_blank`} className={`d-flex align-items-center grid--gap-025`} href={`https://universaleverything.io/${item.from.id}`}>
                                <img style={{ width: `32px`, height: `32px` }} className={`rounded ms-depth-16`} alt={item.from.fullName} title={item.from.fullName} src={`${item.from.profileImages[0].src}`} />
                                {item.from.fullName}
                              </a>
                            ) : (
                              <a target={`_blank`} className={`d-flex align-items-center grid--gap-025`} href={`https://universaleverything.io/${item.from.id}`}>
                                <img style={{ width: `32px`, height: `32px` }} className={`rounded ms-depth-16`} alt={``} title={item.from.fullName} src={`https://universaleverything.io/assets/images/profile-default.svg`} />
                              </a>
                            )}
                          </td>

                          <td className={``}>
                            {item.to.profileImages.length > 0 ? (
                              <a key={i} target={`_blank`} className={`d-flex align-items-center grid--gap-025`} href={`https://universaleverything.io/${item.from.id}`}>
                                <img style={{ width: `32px`, height: `32px` }} className={`rounded ms-depth-16`} alt={item.to.fullName} title={``} src={`${item.to.profileImages[0].src}`} />
                                {item.to.fullName}
                              </a>
                            ) : (
                              <a target={`_blank`} className={`d-flex align-items-center grid--gap-025`} href={`https://universaleverything.io/${item.from.id}`}>
                                <img style={{ width: `32px`, height: `32px` }} className={`rounded ms-depth-16`} alt={``} title={``} src={`https://universaleverything.io/assets/images/profile-default.svg`} />
                              </a>
                            )}
                          </td>

                          <td className={``}>
                            {new Intl.NumberFormat().format(parseFloat(_.fromWei(item.value, `ether`)).toFixed(2))} ${data.data.Asset[0].lsp4TokenSymbol}
                          </td>

                          <td>
                            <Link target={`_blank`} to={`https://explorer.lukso.network/tx/${item.transaction_id}`}>
                              View Transaction
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className={`text-uppercase mt-20 mb-20`}>#100 ${data.data.Asset[0].lsp4TokenSymbol} Holders</h2>

            <div className={`grid grid--fit grid--gap-1 w-100`} style={{ '--data-width': `250px` }}>
              {data.data.Asset[0].holders.map((holder, i) => {
                return (
                  <div
                    key={i}
                    className={`card ${styles['item']} ${data.data.Asset[0].owner_id == holder.profile.id ? styles['owner'] : ''} ${holder.profile.id === `0x000000000000000000000000000000000000dead` ? styles['dead'] : ''}`}
                    data-index={i + 1 === 1 ? `🥇` : i + 1 == 2 ? `🥈` : i + 1 === 3 ? `🥉` : i + 1}
                  >
                    {i < 10 && <video src={AssetVideo} autoPlay loop muted />}
                    <div className={`card__body d-flex align-items-center justify-content-between`}>
                      <b>
                        {new Intl.NumberFormat().format(parseFloat(_.fromWei(holder.balance, `ether`)).toFixed(2))}
                        {/* <small className={`text-info`}> ${data.data.Asset[0].lsp4TokenSymbol}</small> */}
                      </b>
                      {holder.profile.profileImages.length > 0 ? (
                        <a key={i} target={`_blank`} className={`d-f-c flex-column`} href={`https://universaleverything.io/${holder.profile.id}`}>
                          <img className={`rounded ms-depth-16`} alt={holder.profile.name} title={``} src={`${holder.profile.profileImages[0].src}`} />
                          <small>{holder.profile.fullName && holder.profile.fullName.slice(0, 15)} </small>
                        </a>
                      ) : (
                        <a key={i} target={`_blank`} href={`https://universaleverything.io/${holder.profile.id}`}>
                          <img className={`rounded ms-depth-16`} alt={``} title={``} src={`https://universaleverything.io/assets/images/profile-default.svg`} />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      <footer className={`${styles.footer} ms-motion-slideDownIn`}>
        <figure className={`${styles.arattalabs} ms-motion-slideDownIn ms-depth-16`}>
          <img className={styles.nft} src="/arattalabs.svg" alt={`${import.meta.env.NEXT_PUBLIC_NAME}`} width={26} height={26} />
        </figure>
      </footer>
    </div>
  )
}

export default Home
