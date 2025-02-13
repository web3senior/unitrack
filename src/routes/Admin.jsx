import { useEffect, useState, Suspense, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import ABI from './../abi/giftmoji.json'
import Web3 from 'web3'
import styles from './Admin.module.scss'

const web3 = new Web3(window.lukso)
const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)
const _ = web3.utils

function Admin() {
  const [isLoading, setIsLoading] = useState(false)
  const [emoji, setEmoji] = useState([])

  const getAllEmoji = async () => await contract.methods.getAllEmoji().call()

  const addEmoji = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target)
    const metadata = formData.get('metadata')
    const name = formData.get('name')
    const emoji = formData.get('emoji')
    const price = formData.get('price')

    try {
      window.lukso.request({ method: 'eth_requestAccounts' }).then((accounts) => {
        contract.methods
          .addEmoji(metadata, name, emoji, _.toWei(price, `ether`))
          .send({
            from: accounts[0],
          })
          .then((res) => {
            console.log(res) //res.events.tokenId

            setIsLoading(true)

            toast.success(`Done`)
            toast.dismiss(t)
          })
          .catch((error) => {
            toast.dismiss(t)
          })
      })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  const updateEmoji = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const t = toast.loading(`Waiting for transaction's confirmation`)

    const formData = new FormData(e.target)
    const emojiId = formData.get('emojiId')
    const metadata = formData.get('metadata')
    const name = formData.get('name')
    const emoji = formData.get('emoji')
    const price = formData.get('price')
    const status = formData.get('status')
    
    try {
      window.lukso.request({ method: 'eth_requestAccounts' }).then((accounts) => {
        contract.methods
          .updateEmoji(emojiId, metadata, name, emoji, _.toWei(price, `ether`), String(status).toLowerCase() === 'true')
          .send({
            from: accounts[0],
          })
          .then((res) => {
            console.log(res) //res.events.tokenId

            setIsLoading(true)

            toast.success(`Done`)

            toast.dismiss(t)
          })
          .catch((error) => {
            toast.dismiss(t)
          })
      })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  const handleForm = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target)
    const phone = formData.get('phone')
    const password = formData.get('password')
    const errors = {}

    // validate the fields
    if (phone.length < 11) {
      errors.phone = 'err'
      toast(errors.phone, 'error')
    }

    if (typeof password !== 'string' || password.length < 4) {
      errors.password = 'err'
      toast(errors.password, 'error')
    }
    // // return data if we have errors
    // if (Object.keys(errors).length) {
    //   return errors
    // }

    const post = {
      phone: phone,
      password: password,
    }

    try {
      const res = await signUp(post)
      console.log(res)
      if (res.result) {
        localStorage.setItem('token', JSON.stringify(res.token))
        toast(`signed in successfuly`, `success`)
        router.push('/user/dashboard')
      } else {
        toast(`${res.message}`, `error`)
        setIsLoading(false)
      }
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
    return null
  }

  useEffect(() => {
    getAllEmoji().then((res) => {
      console.log(res)
      setEmoji(res)
    })
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <Toaster />
      <div className={`__container`} data-width={`xlarge`}>
      <div className={`grid grid--fit grid--gap-1 w-100`} style={{ '--data-width': `300px` }}>
      
            <div className="card">
              <div className="card__header d-flex align-items-center justify-content-between">
                Add emoji
              </div>
              <div className="card__body">
                {/* {errors?.email && <span>{errors.email}</span>} */}
                <form onSubmit={(e) => addEmoji(e)} className={`form d-flex flex-column`} style={{ rowGap: '1rem' }}>
                  <div>
                    <input type="text" name="metadata" placeholder="Metadata" />
                  </div>

                  <div>
                    <input type="text" name="name" placeholder="Name" required />
                  </div>

                  <div>
                    <input type="text" name="emoji" placeholder="Emoji" required />
                  </div>

                  <div>
                    <input type="text" name="price" placeholder="Price" defaultValue={0.015} required />
                  </div>
                  <button className="mt-20 btn" type="submit">
                    {isLoading ? 'Please wait...' : 'Add'}
                  </button>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card__header d-flex align-items-center justify-content-between">
                Update emoji
              </div>
              <div className="card__body">
                {/* {errors?.email && <span>{errors.email}</span>} */}
                <form onSubmit={(e) => updateEmoji(e)} className={`form d-flex flex-column`} style={{ rowGap: '1rem' }}>
                  <select name={`emojiId`}>
                    {emoji &&
                      emoji.length > 0 &&
                      emoji.map((item, i) => (
                        <option key={i} value={item.emojiId}>
                          {item.emoji} {_.fromWei(item.price, `ether`)} LYX
                        </option>
                      ))}
                  </select>

                  <div>
                    <input type="text" name="metadata" placeholder="Metadata" />
                  </div>

                  <div>
                    <input type="text" name="name" placeholder="Name" required />
                  </div>

                  <div>
                    <input type="text" name="emoji" placeholder="Emoji" required />
                  </div>

                  <div>
                    <input type="text" name="price" placeholder="Price" required />
                  </div>
                  <div>
                    status:
                    <select name="status" id="">
                      <option value={true}>True</option>
                      <option value={false}>False</option>
                    </select>
                  </div>
                  <button className="mt-20 btn" type="submit">
                    {isLoading ? 'Please wait...' : 'Update'}
                  </button>
                </form>
              </div>
            </div>
        
        </div>
      </div>
    </div>
  )
}

export default Admin
