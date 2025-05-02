import { toast } from "sonner"
import { SuiClient } from "@mysten/sui/client"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { generateNonce, generateRandomness, getExtendedEphemeralPublicKey, jwtToAddress } from "@mysten/sui/zklogin"

// Constants for ZK login configuration
const FULLNODE_URL = "https://fullnode.devnet.sui.io"
const GOOGLE_CLIENT_ID = "962179703260-q6gtv8s0vdpqr9neg3sl11fdnbr8mpjj.apps.googleusercontent.com"
const STORAGE_KEY = "zklogin_ephemeral_data"
const suiClient = new SuiClient({ url: FULLNODE_URL })

// Type definitions for ephemeral data stored in session
interface EphemeralData {
  keypair: {
    publicKey: string
    privateKey: number[] 
  }
  maxEpoch: string
  randomness: string
  nonce: string
}

// Generate ephemeral keys and return data needed for OAuth
export const generateEphemeralKeyPair = async () => {
    try {
      console.log("Generating ephemeral key pair...")
  
      // Get the current epoch from Sui
      const { epoch } = await suiClient.getLatestSuiSystemState()
  
      // Set max epoch to current + 2 (key valid for 2 epochs)
      const maxEpoch = Number(epoch) + 2
  
      // Create a new ephemeral keypair
      const ephemeralKeyPair = new Ed25519Keypair()
  
      //  Get public key and encode as base64
      const publicKeyBytes = ephemeralKeyPair.getPublicKey().toSuiBytes()
      
      const publicKey = Buffer.from(publicKeyBytes).toString("base64")
  
      // Slice only the private (secret) key part (32 bytes), skip first byte
      const secretKey = ephemeralKeyPair.getSecretKey() // Uint8Array
      const privateKeyBytes = secretKey.slice(1, 33) 
      
      // Fix: Explicitly convert Uint8Array values to numbers
      const privateKeyArray = Array.from(privateKeyBytes, byte => Number(byte))
  
      // Generate randomness and nonce for the login flow
      const randomness = generateRandomness()
      const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness)
  
      // Store the ephemeral key data for later use
      const ephemeralData: EphemeralData = {
        keypair: {
          publicKey,
          privateKey: privateKeyArray,
        },
        maxEpoch: maxEpoch.toString(),
        randomness: randomness.toString(),
        nonce,
      }
  
      // Save to session storage (more secure than localStorage for sensitive data)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ephemeralData))
  
      return {
        nonce,
        maxEpoch: maxEpoch.toString(),
      }
    } catch (error) {
      console.error("Error generating ephemeral key pair:", error)
      toast.error("Failed to generate login credentials")
      throw error
    }
}
  
// Build the Google OAuth URL with the nonce
export const buildOAuthUrl = (nonce: string) => {
  const REDIRECT_URL = encodeURIComponent("http://localhost:8080/auth/callback")
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=id_token&redirect_uri=${REDIRECT_URL}&scope=openid&nonce=${nonce}`
}

export const getUserSalt = async (jwt: string) => {
  try {

    console.log("Getting user salt with JWT:", jwt.substring(0, 10) + "...")

    const mockSalt = "129390038577185583942388216820280642146";
    console.log("Using mock salt:", mockSalt);
    return mockSalt;
    
    /*
    const response = await fetch("https://salt.api.mystenlabs.com/get_salt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors", // เพิ่ม mode no-cors
      body: JSON.stringify({ token: jwt }),
    })

    // หมายเหตุ: mode no-cors จะทำให้ response เป็น opaque, ไม่สามารถอ่านค่าได้
    // ควรใช้ proxy server หรือ backend service แทน
    if (!response.ok) throw new Error(`Salt service error: ${response.status}`)

    const data = await response.json()
    return data.salt
    */
  } catch (error) {
    console.error("Error getting user salt:", error)
    toast.error("Failed to get user identity data")
    throw error
  }
}

export const getZkProof = async (
  jwt: string,
  extendedEphemeralPublicKey: string,
  maxEpoch: string,
  randomness: string,
  salt: string,
) => {
  try {
    console.log("Getting ZK proof with inputs:", {
      jwtShort: jwt.substring(0, 10) + "...",
      extendedEphemeralPublicKey: extendedEphemeralPublicKey.substring(0, 10) + "...",
      maxEpoch,
      randomness: randomness.substring(0, 10) + "...",
      salt
    });
    
    // ใช้ค่า zkProof ทดสอบ - ในกรณีจริงควรเรียกผ่าน backend service
    const mockZkProof = {
      proofPoints: {
        a: [
          "17267520948013237176538401967633949796808964318007586959472021003187557716854",
          "14650660244262428784196747165683760208919070184766586754097510948934669736103",
          "1"
        ],
        b: [
          [
            "21139310988334827550539224708307701217878230950292201561482099688321320348443",
            "10547097602625638823059992458926868829066244356588080322181801706465994418281"
          ],
          [
            "12744153306027049365027606189549081708414309055722206371798414155740784907883",
            "17883388059920040098415197241200663975335711492591606641576557652282627716838"
          ],
          ["1", "0"]
        ],
        c: [
          "14769767061575837119226231519343805418804298487906870764117230269550212315249",
          "19108054814174425469923382354535700312637807408963428646825944966509611405530",
          "1"
        ]
      },
      issBase64Details: {
        value: "wiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiw",
        indexMod4: 2
      },
      headerBase64: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ"
    };
    
    console.log("Using mock ZK proof");
    return mockZkProof;
    
    /*
    const PROVER_URL = "https://prover-dev.mystenlabs.com/v1"

    const response = await fetch(PROVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors", // เพิ่ม mode no-cors
      body: JSON.stringify({
        jwt,
        extendedEphemeralPublicKey,
        maxEpoch,
        jwtRandomness: randomness,
        salt,
        keyClaimName: "sub",
      }),
    })

    // หมายเหตุ: mode no-cors จะทำให้ response เป็น opaque, ไม่สามารถอ่านค่าได้
    // ควรใช้ proxy server หรือ backend service แทน
    if (!response.ok) throw new Error(`Prover service error: ${response.status}`)

    return await response.json()
    */
  } catch (error) {
    console.error("Error getting ZK proof:", error)
    toast.error("Failed to generate secure login proof")
    throw error
  }
}

export const executeZkLogin = async (idToken?: string) => {
  try {
    console.log("Executing zkLogin flow...")

    if (!idToken) {
      const { nonce } = await generateEphemeralKeyPair()
      const oauthUrl = buildOAuthUrl(nonce)
      window.location.href = oauthUrl
      return { success: false, redirecting: true }
    }

    const ephemeralDataStr = sessionStorage.getItem(STORAGE_KEY)
    if (!ephemeralDataStr) {
      toast.error("Login session expired. Please try again.")
      return { success: false, error: "Session expired" }
    }

    const ephemeralData: EphemeralData = JSON.parse(ephemeralDataStr)
    
    const privateKeyBytes = new Uint8Array(ephemeralData.keypair.privateKey)
    
    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes)

    const userSalt = await getUserSalt(idToken)
    const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey())

    const zkProof = await getZkProof(
      idToken,
      extendedEphemeralPublicKey.toString(),
      ephemeralData.maxEpoch,
      ephemeralData.randomness,
      userSalt,
    )

    const userAddress = jwtToAddress(idToken, userSalt)

    const zkLoginData = {
      userAddress,
      userSalt,
      ephemeralData,
      zkProof,
    }

    sessionStorage.setItem("zklogin_session", JSON.stringify(zkLoginData))

    console.log("zkLogin complete")
    return {
      success: true,
      address: userAddress,
    }
  } catch (error) {
    console.error("zkLogin error:", error)
    toast.error("Failed to complete zkLogin process")
    return {
      success: false,
      error,
    }
  }
}

export const hasActiveZkLoginSession = () => {
  return !!sessionStorage.getItem("zklogin_session")
}

export const getZkLoginSession = () => {
  const session = sessionStorage.getItem("zklogin_session")
  return session ? JSON.parse(session) : null
}

export const clearZkLoginSession = () => {
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem("zklogin_session")
}

export const handleZkLoginCallback = async (jwt: string) => {
  return await executeZkLogin(jwt)
}