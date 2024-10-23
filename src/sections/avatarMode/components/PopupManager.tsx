import React, { useState, useCallback, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { PopupType } from "@/types/type";

import { useWebRTCManager } from "@/lib/webrtcClient";
import { useSelectedMenuItemStore } from "@/store/selectedMenuItem";
import { UserContext } from "@/provider/UserContext";
import usePayStripeCardPayment from "@/hooks/use-pay-stripe-card-payment";
import CardElement from "@/components/StripeCard";

import { voiceMappings, languageOptions, voiceOptions } from "../Constant";

interface PopupData {
  type: PopupType;
  apiKey: string;
  selectedLanguage: string;
  selectedVoice: string;
  welcomeMessage: string;
  persona: string;
  uploadedFile: File | null;
  shareLink: string;
  avatarName: string;
}

interface PopupManagerProps {
  type: PopupType;
  onClose: () => void;
  onConfirm?: (data: PopupData) => void;
  selectedLanguage?: string;
  onLanguageSelect?: (language: string) => void;
  selectedVoice?: string;
  onVoiceSelect?: (language: string) => void;
  onPayCredits?: (creditAmount: number) => void;
  onSaveAvatar?: () => void;
  onCreateAvatar?: (avatarName: string) => void;
  showToast?: (message: string) => void;
}

const PopupManager: React.FC<PopupManagerProps> = ({
  type,
  onClose,
  onConfirm = () => {},
  selectedLanguage,
  selectedVoice,
  onPayCredits,
  onCreateAvatar,
  onSaveAvatar,
  showToast,
  onLanguageSelect,
  onVoiceSelect,

}) => {
  const router = useRouter();

  const {
    loadAndSendAvatarData,
    handleSendCommands,
    handleResetButtonClick,
    isWebRTCConnected,
    getLastResponse,
    getSelectedCommand,
  } = useWebRTCManager();

  const selectedItems = useSelectedMenuItemStore((state) => state.items);
  const setHair = useSelectedMenuItemStore((state) => state.setHair);
  const setWardrobe = useSelectedMenuItemStore((state) => state.setWardrobe);

  const payStripeCardPayment = usePayStripeCardPayment();
  const {
    userInfo,
    credits,
    loading,
    isAuthenticated,
    subscription,
    refetchUserData,
  } = useContext(UserContext);

  const [formData, setFormData] = useState<PopupData>({
    type,
    apiKey: "",
    selectedLanguage: selectedLanguage, 
    selectedVoice: selectedVoice,
    welcomeMessage: "",
    persona: "",
    uploadedFile: null,
    shareLink: "",
    avatarName: "",
  });

  const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "";

  const encryptData = useCallback(
    (avatarId: number, userId: number): string => {
      const data = `${avatarId}|${userId}`;
      let result = "";
      for (let i = 0; i < data.length; i++) {
        const charCode =
          data.charCodeAt(i) ^
          ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
        result += String.fromCharCode(charCode);
      }
      return btoa(result)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    },
    [ENCRYPTION_KEY]
  );

  useEffect(() => {
    const encrypted = encryptData(1, 1);
    setFormData((prev) => ({
      ...prev,
      shareLink: `${FRONTEND_URL}/sharedAvatar?data=${encrypted}`,
      avatarName: `Avatar_${new Date().getTime()}`, // Default avatar name
    }));
  }, [FRONTEND_URL, encryptData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(formData.shareLink)
      .then(() => {
        console.log("Link copied to clipboard");
        handleConfirm("share");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  const handleLanguageSelect = (lang: string) => {
    setFormData((prev) => ({ ...prev, selectedLanguage: lang }));
    onLanguageSelect(lang)
  };

  const handleVoiceSelect = (voice: string) => {
    setFormData((prev) => ({ ...prev, selectedVoice: voice }));
    onVoiceSelect(voice)
  };

  const handleConfirm = (type: PopupType) => {
    onConfirm({ ...formData, type: type });
  };

  const handleExistFunction = () => {
    router.push("/profile");
    localStorage.removeItem("create_mode");
    localStorage.removeItem("avatar_id");
    setWardrobe("");
    setHair("");
  };

  const handleSaveAvatar = () => {
    handleConfirm("save-avatar");
    onCreateAvatar(formData.avatarName);
  };

  const renderChatSetting = () => (
    <div id="personaPopup" className="personaPopup assitant-popup">
      <form className="personaForm">
        <span id="personaClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3 className="font-bold text-3xl mb-4">Chat Setting</h3>
        <p className="mb-4">
          When creating the avatar, you need to save avatar first before saving
          the welcome message and prompt.
        </p>
        <div className="welcome-section flex flex-col items-start w-full mb-3">
          <label htmlFor="welcomeMessage">Enter your welcome message</label>
          <input
            id="welcomeMessage"
            placeholder="Type your welcome message here"
            value={formData.welcomeMessage}
            onChange={handleInputChange}
          />
        </div>
        <div className="prompt-section flex flex-col items-start w-full">
          <label htmlFor="persona">Enter your prompt</label>
          <textarea
            id="persona"
            placeholder="Type your persona here"
            rows={15}
            cols={80}
            value={formData.persona}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <button
          type="button"
          id="personaConfirmButton"
          onClick={() => handleConfirm("chat-setting")}
        >
          Save
        </button>
      </form>
    </div>
  );

  const renderChatGPTKey = () => (
    <div id="apiPopup" className="apiPopup assitant-popup">
      <form id="apiKeyForm">
        <span id="apiClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Enter Your ChatGPT Key</h3>
        <br />
        <p>API key save only for this session</p>
        <input
          type="text"
          placeholder="Paste your API key here"
          id="apiKey"
          value={formData.apiKey}
          onChange={handleInputChange}
        />
        <button
          type="button"
          id="apiKeyConfirmButton"
          onClick={() => handleConfirm("chatgpt-key")}
        >
          Confirm
        </button>
      </form>
    </div>
  );

  const renderVoice = () => (
    <div id="voicePopup" className="voicePopup assitant-popup">
      <form id="voiceForm">
        <span id="voiceClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Choose a Voice</h3>
        <ul id="voiceList">
          {voiceOptions.map((voice) => (
            <div
              key={voice.value}
              className={`voice-option cursor-pointer p-2 ${
                formData.selectedVoice === voice.value
                  ? "selected"
                  : "bg-gray-800"
              }`}
              onClick={() => {
                handleVoiceSelect(voice.value);
              }}
            >
              {voice.name}
            </div>
          ))}
        </ul>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </form>
    </div>
  );

  const renderLanguage = () => (
    <div id="languagePopup" className="languagePopup assitant-popup">
      <form id="languageForm">
        <span id="languageClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Select a Language</h3>
        <ul id="languageList">
          {languageOptions.map((language) => (
            <div
              key={language.code}
              className={`language-option flex items-center gap-2 cursor-pointer p-2 ${
                formData.selectedLanguage === language.lang
                  ? "selected"
                  : "bg-gray-800"
              }`}
              onClick={() => {
                handleLanguageSelect(language.lang);
              }}
            >
              <span
                className={`flag-icon flag-icon-${language.flagClass}`}
              ></span>
              <span>{language.lang}</span>
            </div>
          ))}
        </ul>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </form>
    </div>
  );

  const renderUploadAvatar = () => (
    <div id="dhsPopup" className="dhs-popup assitant-popup">
      <form id="dhsForm">
        <span id="dhsClose" className="dhs-close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Upload Your DHS File</h3>
        <div
          className="dhs-dropzone"
          id="dhsDropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            setFormData((prev) => ({ ...prev, uploadedFile: file }));
          }}
        >
          Drag and drop your DHS file here
        </div>
        <p
          id="uploadStatus"
          style={{
            display: formData.uploadedFile ? "block" : "none",
            color: "lightgreen",
          }}
        >
          File uploaded successfully!
        </p>
        <button
          type="button"
          id="dhsConfirmButton"
          onClick={() => handleConfirm("upload-avatar")}
        >
          Upload
        </button>
      </form>
    </div>
  );

  const renderShare = () => (
    <div id="sharePopup" className="sharePopup assitant-popup">
      <form id="shareForm">
        <span id="shareClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Publish</h3>
        <br />
        <p>
          Publishing your avatar to make it public and share with your friends
        </p>
        <input
          type="text"
          placeholder="Copy this link to share"
          id="shareLink"
          value={formData.shareLink}
          onChange={handleInputChange}
          readOnly
        />
        <button type="button" id="shareConfirmButton" onClick={handleCopyLink}>
          Copy Link
        </button>
      </form>
    </div>
  );

  const renderExit = () => (
    <div id="exitConfirmation" className="modal-exit">
      <div className="modal-content-exit">
        <h3>Are you sure you want to exit?</h3>
        <div className="modal-buttons-exit">
          <button
            id="save-exit"
            className="save-exit"
            onClick={handleExistFunction}
          >
            Yes
          </button>
          <button className="exit" onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </div>
  );

  const renderSaveAvatar = () => (
    <div id="popup" className="popup">
      <form id="avatarForm" onSubmit={handleSaveAvatar}>
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>New Persona</h3>
        <img
          className="avatar-icon"
          src="/images/Default_Avatar_Icon.png"
          alt="Default Avatar"
        />
        <input
          type="text"
          placeholder="Avatar name"
          id="avatarName"
          value={formData.avatarName}
          onChange={handleInputChange}
        />
        <button type="submit" id="confirmButton">
          Confirm
        </button>
      </form>
    </div>
  );

  const creditBuy = () => {
    const [showCardElement, setShowCardElement] = useState(false);
    const [cardElementState, setCardElementState] = useState({
      errorMessage: "",
      complete: false,
    });
    const [cardPaymentState, setCardPaymentState] = useState({
      errorMessage: "",
    });
    const [price, setPrice] = useState<number | null>(0);
    const [amount, setAmount] = useState<number | null>(0);
    const [isPaying, setIsPaying] = useState<boolean | null>(false);
    const handleCreditSelection = (price: number, amount: number) => {
      setShowCardElement(true);
      setAmount(amount);
      setPrice(price);
    };

    const handleCreditPay = async () => {
      try {
        setIsPaying(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch("/api/credit/payment_intent/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            price: price,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to create payment intent");
        }

        const paymentIntent = result.data;

        const payResult = await payStripeCardPayment(
          {
            client_secret: paymentIntent.client_secret,
          },
          {
            name: "",
          }
        );

        if (
          payResult &&
          payResult.paymentIntent &&
          payResult.paymentIntent.status === "succeeded"
        ) {
          const confirmResponse = await fetch(
            "/api/credit/payment_intent/confirm",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                payment_intent_id: payResult.paymentIntent.id,
                price: price,
              }),
            }
          );

          const confirmResultStatus = await confirmResponse.json();
          if (confirmResultStatus.success !== true) {
            throw new Error(
              confirmResultStatus.error || "Failed to verify payment"
            );
          } else {
            await refetchUserData();
            setIsPaying(false);
            setCardPaymentState({ errorMessage: "Payment successful!" });
            setShowCardElement(false);
            showToast(
              `Added ${amount} credits successfully. Please try to save avatar again! `
            );
            onClose();
            // onSaveAvatar();
          }
        }
      } catch (error) {
        console.error("Error in handleCreditPay:", error);
        showToast("Failed to add credit");
        throw error;
      }
    };
    return (
      <div
        id="buyCreditsConfirmation"
        className="modal-exit"
        style={{ width: "60%", backgroundColor: "unset" }}
      >
        <div className="modal-content-exit credit_card_modal">
          <div className="credit_amount_section credit_section">
            <h3 className="credit_modal_title">BUY CREDITS</h3>
            {Object.entries({ 12: 100, 30: 200, 60: 5000, 96: 1000 }).map(
              ([curPrice, amount]) => (
                <button
                  key={price} // Use price as the key
                  className={`credit-button ${
                    price === +curPrice ? "selected" : ""
                  }`} // Convert price to number for comparison
                  onClick={() => handleCreditSelection(+curPrice, amount)} // Convert price to number
                >
                  {amount} (€{curPrice}) {/* Display amount and price */}
                </button>
              )
            )}
            <button className="cancel-button" onClick={onClose}>
              CANCEL
            </button>
          </div>

          {price && (
            <div className="credit_amount_view_section credit_section">
              <div>
                <h2 className="total-price">€{price}</h2>
                <div className="price-breakdown">
                  <span>Buy credit</span>
                  <span className="credit-amount">€{price}</span>
                </div>
                <div className="price-breakdown">
                  <span>Subtotal</span>
                  <span className="sub-credit-amount">€{price}</span>
                </div>
                <button className="promo-code-button">Add promo code</button>
                <div className="total-due">
                  <span>Total due</span>
                  <span className="total-credit-amount">€{price}</span>
                </div>
              </div>
              <p className="powered-by">Powered by Stripe</p>
            </div>
          )}

          <div className="credit_card_detail_section credit_section">
            <h3 className="section-title">Pay with card</h3>
            {showCardElement && !subscription?.exists && (
              <div className="mt-8 max-w-md mx-auto p-6 rounded-lg">
                <CardElement
                  onChange={(e) => {
                    setCardElementState({
                      errorMessage: e.error ? e.error.message : "",
                      complete: e.complete,
                    });
                    setCardPaymentState({ errorMessage: "" });
                  }}
                />
                {(cardElementState.errorMessage ||
                  cardPaymentState.errorMessage) && (
                  <p className="text-red-500 mt-2">
                    {cardElementState.errorMessage ||
                      cardPaymentState.errorMessage}
                  </p>
                )}
                <button
                  className={`w-full bg-blue-standard text-white py-2 rounded-full mt-4 ${
                    isPaying ? "pointer-events-none" : ""
                  }`}
                  onClick={handleCreditPay}
                  disabled={!cardElementState.complete}
                >
                  {isPaying ? "Paying..." : "Pay Now"}
                </button>
              </div>
            )}
            <p className="terms">
              By providing your card information, you allow [YOUR STRIPE ACCOUNT
              NAME] to charge your card for future payments in accordance with
              their terms*.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const creditPay = () => {
    return (
      <div id="saveAvatarConfirmation" className="modal-exit px-8">
        <div className="modal-content-exit">
          <h2 style={{ fontSize: "25px" }}>Charged Credits</h2>
          <ul
            className="charged_credit_list mb-4"
            style={{ listStyleType: "disc", textAlign: "left" }}
          >
            {selectedItems.hair && <li>HAIR Credit Amount: {2}</li>}
            {selectedItems.wardrobe && <li>WARDROBE Credit Amount: {3}</li>}
          </ul>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="save-exit menu-button"
              onClick={() =>
                onPayCredits(
                  selectedItems.hair && selectedItems.wardrobe
                    ? 5
                    : selectedItems.hair
                    ? 2
                    : 3
                )
              }
            >
              Save
            </button>
            <button className="exit" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case "chat-setting":
        return renderChatSetting();
      case "chatgpt-key":
        return renderChatGPTKey();
      case "voice":
        return renderVoice();
      case "language":
        return renderLanguage();
      case "upload-avatar":
        return renderUploadAvatar();
      case "share":
        return renderShare();
      case "exit":
        return renderExit();
      case "save-avatar":
        return renderSaveAvatar();
      case "pay-credit":
        return creditPay();
      case "buy-credit":
        return creditBuy();
      default:
        return null;
    }
  };

  return renderContent();
};

export default PopupManager;
