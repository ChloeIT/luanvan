import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useFilteredHotel } from "../../common/useFilteredHotel";
import { Link } from "react-router-dom";
import { Avatar } from "antd";

export const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  const { hotels } = useSelector((state) => state.hotel);

  const { hotelFilter, debounceFetch } = useFilteredHotel({
    hotels: hotels,
  });

  useEffect(() => {
    debounceFetch(searchTerm);
  }, [searchTerm]);

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 100);
  };
 useEffect(()=> {
    console.log(hotelFilter);
 },[searchTerm])
  return (
    <div className="relative w-full min-w-96 max-w-md">
      <label className="flex items-center gap-2 bg-white shadow-md border border-gray-300 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
        <IoSearch className="text-gray-500 text-xl cursor-pointer" />
        <input
          type="search"
          className="flex-grow text-sm text-gray-700 focus:outline-none placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="Search hotels..."
        />
      </label>

      {/* Dropdown suggestions */}
      {isFocused && (
        <div className="absolute w-full max-h-80 overflow-y-auto left-0 top-full mt-2 bg-white shadow-lg rounded-lg z-10">
          <div
            className={`${
              hotelFilter.length > 0 ? "" : "hidden"
            } bg-gray-100 px-4 py-2`}
          >
            <p className="text-sm font-medium text-gray-600">Results</p>
          </div>
          {hotelFilter.map((hotel, index) => (
            <Link
              to={`/hotel/${hotel.id}`}
              key={index}
              //   onClick={() => setSearchTerm("")}
              className="block px-4 py-2 hover:bg-gray-200"
            >
              <div className="flex items-center">
                <div className=" bg-gray-200 rounded-full mr-4">
                  {/* Add an image if available */}
                  <Avatar
                    className="img-fluid"
                    size={40}
                    src={`${IMAGE_URL}/hotels/${hotel.image}`}
                    alt=""
                  />
                </div>
                <div>
                  <h1 className="text-lg font-sans text-primary">
                    {hotel.name}
                  </h1>
                  <h4 className="text-xs font-thin text-gray-800">
                    {hotel.address}
                  </h4>
                </div>
              </div>
            </Link>
          ))}
          {hotelFilter.length === 0 && (
            <p className="text-center text-gray-500 py-4">No results found</p>
          )}
        </div>
      )}
    </div>
  );

};
