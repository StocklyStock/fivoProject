import { useState } from "react";

const FAQListing = ({ faq }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    
    return (
        <li onClick={() => setMenuOpen((prevState) => !prevState)}>
            <h1>{faq.title} <span>{menuOpen ? "-" : "+"}</span></h1>
            <div className={menuOpen ? "menu-open": ""}>
                    <p>
                        {faq.description}
                    </p>
            </div>           
        </li>
    );
}

export default FAQListing;