const ThemeListings = ({ stock_list  = [] }) => {
    
    console.log("🧪 ThemeListings에 전달된 종목:", stock_list); // 확인용
    
    return (
        <div>
            <div className="headline-wrap"><h2><span>관련 종목</span></h2><button>상세보기 </button></div>
            <div className="list-wrap">
                <ul>
                    {stock_list.map((stock, index) => (
                        <li key={index}>
                            <a href={stock.link} target="_blank" rel="noopener noreferrer">
                                {stock.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
export default ThemeListings;