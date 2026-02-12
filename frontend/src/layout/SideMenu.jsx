import React from "react";
import { AiOutlineHome, AiOutlineSearch, AiOutlineHeart } from "react-icons/ai";

export const SideMenu = () => {
  return (
    <aside className="sidemenu-root">
      <div className="sidemenu-header">
        <img src="" alt="Project Logo" className="sidemenu-logo-img" />
        <h2 className="sidemenu-logo-title">Synthesia</h2>
      </div>

      <nav className="sidemenu-nav" aria-label="Main Navigation">
        <ul className="sidemenu-nav-list">
          <li>
            <button className="sidemenu-nav-btn active">
              <AiOutlineHome className="sidemenu-nav-icon" size={18} />
              <span>Home</span>
            </button>
          </li>
          <li>
            <button className="sidemenu-nav-btn active">
              <AiOutlineSearch className="sidemenu-nav-icon" size={18} />
              <span>Search</span>
            </button>
          </li>
          <li>
            <button className="sidemenu-nav-btn active">
              <AiOutlineHeart className="sidemenu-nav-icon" size={18} />
              <span>My Favourite</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};
export default SideMenu;
