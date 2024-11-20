import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { userServices } from "../services";
import { Avatar } from "antd";

export const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const IMAGES_URL = import.meta.env.VITE_IMAGE_URL;

  const [changeInfo, setChangeInfo] = useState(false);
  const [fullName, setFullName] = useState();
  const [username, setUserName] = useState();
  const [address, setAddress] = useState();
  const [email, setEmail] = useState();
  const [gender, setGender] = useState();
  const [image, setImage] = useState();
  const [phone, setPhone] = useState();
  const [birthDate, setBirthDate] = useState();
  const fullnameInputRef = useRef();
  // const fullnameInputRef = useRef(null);
  // const descriptionInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFullName(user?.fullName);
      setUserName(user?.username);
      setAddress(user?.address);
      setEmail(user?.email);
      setPhone(user?.phone);
      setGender(user?.gender);
      setImage(user?.image);
      setBirthDate(user?.birthDate);
    }
  }, [user]);

  const handleChangeInfo = () => {
    setChangeInfo(true);
    setTimeout(() => {
      fullnameInputRef.current?.focus();
    }, 0);
  };

  const handleSaveInfo = async () => {
    try {
      const updatedUser = {
        fullName,
        phone,
        address,
        birthDate,
        gender,
      };
      const response = await userServices.edit(user.id, updatedUser);

      if (response.status === 200) {
        // const updatedUser = { ...user, fullname, description };

        // localStorage.setItem("user", JSON.stringify(updatedUser));
        setChangeInfo(false);
      }
    } catch (error) {
      console.error("Failed to update full name:", error);
    }
  };
  const handleCancel = () => {
    setFullName(user?.fullname);
    setChangeInfo(false);
  };

  console.log(IMAGES_URL);

  return (
    <div className="text-center">
      <div className="mb-2">
        <p className="text-primary  font-bold text-2xl">Profile</p>
      </div>
      <Avatar
        className="my-2"
        size={100}
        src={`${IMAGES_URL}/users/${image}`} // Adjust the relative path as necessary
        alt={`image ${image}`}
      />
      <div className="mb-2">
        <label className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto">
          <span className="min-w-[100px]">User name</span>
          <input
            ref={fullnameInputRef}
            readOnly
            type="text"
            className="grow"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-2">
        <label className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto">
          <span className="min-w-[100px]">Full Name</span>
          <input
            ref={fullnameInputRef}
            type="text"
            className="grow"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-2">
        <label className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto">
          <span className="min-w-[100px]">Email</span>
          <input
            readOnly
            type="text"
            className="grow"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-2">
        <label className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto">
          <span className="min-w-[100px]">Phone</span>
          <input
            type="text"
            className="grow"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-2">
        <label className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto">
          <span className="min-w-[100px]">Address</span>
          <input
            type="text"
            className="grow"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-2">
        <label className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto">
          <span className="min-w-[100px]">Gender</span>
          <input
            type="text"
            className="grow"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
        </label>
      </div>

      <div className="mb-2">
        <label className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto">
          <span className="min-w-[100px]">Birth Date</span>
          <input
            type="text"
            className="grow"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </label>
      </div>

      <div className="mb-2">
        {/* <button
          className="btn btn-outline m-1 btn-accent rounded-full"
          onClick={() =>
            document.getElementById("change_password_modal").showModal()
          }
        >
          Đổi mật khẩu
        </button> */}

        {!changeInfo ? (
          <button
            className=" rounded-xl py-2 px-3 btn-primary ml-auto my-2"
            onClick={handleChangeInfo}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              className="rounded-xl py-2 px-3 btn-primary ml-auto my-2"
              onClick={handleSaveInfo}
            >
              Save
            </button>
            <button
              className=" rounded-xl py-2 px-3 btn-outline m-1 btn-error "
              onClick={handleCancel}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};
