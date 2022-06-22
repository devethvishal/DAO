import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { providers, utils, Contract } from "ethers";
import {
  NFT_CONTRACT_ADDR,
  NFT_CONTRACT_ABI,
  CryptoDevDAO_ADDR,
  CryptoDevDAO_ABI,
} from "../constants";
import { useRef, useEffect, useState } from "react";
import Web3Modal from "web3modal";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nftBalance, setNftBalance] = useState(0);
  const [selectedTab, setSelectedTab] = useState("");

  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const numProposals = useRef("0");
  const [proposals, setProposals] = useState([]);
  const [fakeNftTokenId, setFakeNftTokenId] = useState("");
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Plese switch to the Rinkeby network.");
      throw new Error("Plese switch to the Rinkeby network.");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const getNftContractInstance = (providerOrSinger) => {
    return new Contract(NFT_CONTRACT_ADDR, NFT_CONTRACT_ABI, providerOrSinger);
  };

  const getDAOContractInstance = (providerOrSinger) => {
    return new Contract(CryptoDevDAO_ADDR, CryptoDevDAO_ABI, providerOrSinger);
  };

  const getDAOTreasuryBalance = async () => {
    try {
      const provider = await getProviderOrSigner();
      const balance = await provider.getBalance(CryptoDevDAO_ADDR);
     
      setTreasuryBalance(balance);
    } catch (err) {
      console.log(err);
    }
  };

  const getNumberOfDAOProposals = async () => {
    try {
      const provider = await getProviderOrSigner();
      const daoContract = getDAOContractInstance(provider);
      const numOfProposals = await daoContract.numProposals();
      const proposalCount = parseInt(numOfProposals.toString());
      numProposals.current = proposalCount;
      console.log("hello",proposalCount);
      return proposalCount;
    } catch (err) {
      console.log(err);
    }
  };

  const getNftBalance = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = getNftContractInstance(signer);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      setNftBalance(parseInt(balance.toString()));
    } catch (err) {
      console.log(err);
    }
  };

  const createProposal = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDAOContractInstance(signer);
      const tx = await daoContract.createProposal(fakeNftTokenId);
      setLoading(true);
      await tx.wait();
      await getNumberOfDAOProposals();
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProposalById = async (id) => {
    try {
      console.log("7777777777777777777");
      const provider = await getProviderOrSigner();
      console.log("111111111");
      const daoContract = getDAOContractInstance(provider);
      console.log("111111111");
      const proposal = await daoContract.proposals(id);
      console.log("111111111");

      console.log("Vishal 1",proposal);
      const parsedProposal = {
        proposalId: id,
        nftTokenId: proposal.nftTokenId.toString(),
        deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
        yayVotes: proposal.yayVotes.toString(),
        nayVotes: proposal.nayVotes.toString(),
        executed: proposal.executed
      };
      return parsedProposal;
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAllProposals = async () => {
    try {
      console.log("1111111111111");
      const proposals = [];
      console.log("asd",numProposals.current);  
      for (let i = 0; i < numProposals.current; i++) {
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
      }
      setProposals(proposals);
    } catch (err) {
      console.log(err);
    }
  };

  const voteOnProposal = async (proposalId, _vote) => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDAOContractInstance(signer);

      const vote = _vote === "YAY" ? 0 : 1;
      const tx = await daoContract.voteOnProposal(proposalId, vote);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await fetchAllProposals();
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: [],
        disableInjectedProvider: false,
      });
      connectWallet().then(() => {
        getNumberOfDAOProposals();
        getDAOTreasuryBalance();
        getNftBalance();
        fetchAllProposals();
      });
    }
  }, [walletConnected]);


  useEffect(() => {
    if (selectedTab === "View Proposal") {
     console.log("asdfjajjadsj");
     fetchAllProposals();      
    }
  }, [selectedTab]);

  const renderCreateButton = () => {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalance === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  };

  const renderViewButton = () => {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (numProposals === 0) {
      return (
        <div className={styles.description}>
          No proposals have been created
        </div>
      );
    } else {
      return (
        <div style={{display:"flex", flexDirection:"row"}}>
          {proposals.map((p, index) => (
            <div key={index} style={{margin:"10px 10px"}} className={styles.proposalCard}>
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "YAY")}
                  >
                    Vote YAY
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "NAY")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  const renderTabs = () => {
    if(selectedTab === "Create Proposal"){
      return renderCreateButton();
    } else {
    return renderViewButton();
    }
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
        <div className={styles.description}>Welcome to the DAO!</div>
        <div className={styles.description}>
          Your CryptoDevs NFT Balance: {nftBalance}
          <br />
          Treasury Balance: {utils.formatEther(treasuryBalance)} ETH
          <br />
          Total Number of Proposals: {numProposals.current}
        </div>
        <div style={{display:"flex", flexDirection:"row"}} className={styles.flex}>
          <button
            className={styles.button}
            onClick={() => setSelectedTab("Create Proposal")}
          >
            Create Proposal
          </button>
          <button
            className={styles.button}
            onClick={() => {console.log("View Proposal");setSelectedTab("View Proposal");}}
          >
            View Proposal
          </button>
        </div>
        {renderTabs()}
        <div>
          <img className={styles.image} src="0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Made with ❤ by Vishal @ 2022</footer>
    </div>
  );
}
