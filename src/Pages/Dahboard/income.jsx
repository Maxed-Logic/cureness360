import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "../../assets/dashboardcss/css/Dashboard.css";


const Income = () => {
    const navigate = useNavigate();
    const { userData, loading } = useUser();

    // Modified function to accept type parameter
    const goToPage = (type) => {
        navigate(`/dashboard/accstatement?type=${type}`);
    };

    // Loading state
    if (loading && !userData) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-white">Fetching Income Details...</p>
            </div>
        );
    }

    return (
        <div className="flowchart-container ">
            {/*  MAIN NODE: All Income */}
            <div
                className="p-3 flowchart-node wallet-buttton"
                onClick={() => goToPage("ALL")}
                style={{ cursor: 'pointer' }}
            >
                All income <br />
                <strong className="currency1" data-value={userData?.Working || 0}>
                    ${userData?.Working || 0}
                </strong>
            </div>

            <div className="flowchart-line-vertical"></div>
            <div className="flowchart-line-horizontal"></div>

            <div className="flowchart-row">

                {/*  Column 1: Level & Matching */}
                <div className="flowchart-column">
                    <div className="flowchart-node flowchart-green" onClick={() => goToPage("LEVEL INCOME")}>
                        M-Subscription Level Income <br />
                        <span className="currency1" data-value={userData?.LevelIncome || 0} style={{ color: "#105614", fontWeight: "700" }}>
                            ${userData?.LevelIncome || 0}
                        </span>
                    </div>
                    <div className="flowchart-line-vertical-small"></div>
                    <div className="flowchart-node flowchart-orange" onClick={() => goToPage("MATCHING INCOME")}>
                        M-Subscription Matching Income <br />
                        <span className="currency1" data-value={userData?.MatchingBonus || 0} style={{ color: "#105614", fontWeight: "700" }}>
                            ${userData?.MatchingBonus || 0}
                        </span>
                    </div>
                </div>

                {/*  Column 2: IB & Reward */}
                <div className="flowchart-column">
                    <div className="flowchart-node flowchart-green" onClick={() => goToPage("TRADING PASSIVE INCOME")}>
                        Trading Passive Income <br />
                        <span className="currency1" data-value={userData?.TradingPassiveIncome || 0} style={{ color: "#105614", fontWeight: "700" }}>
                            ${userData?.TradingPassiveIncome || 0}
                        </span>
                    </div>
                    <div className="flowchart-line-vertical-small"></div>

                    <div className="flowchart-column">
                        <div className="flowchart-node flowchart-green" onClick={() => goToPage("LOST IB INCOME")}>
                            IB Income <br />
                            <span className="currency1" data-value={userData?.IBIncome || 0} style={{ color: "#105614", fontWeight: "700" }}>
                                ${userData?.IBIncome || 0}
                            </span>
                        </div>
                    </div>

                    <div className="flowchart-line-vertical-small d-none d-md-block "></div>
                    <div className="flowchart-node flowchart-orange d-none d-md-block" onClick={() => goToPage("FUND WITHDRAWAL")}>
                        Withdrawal <br />
                        <span className="currency1" data-value={userData?.withdrawal || 0} style={{ color: "#105614", fontWeight: "700" }}>
                            ${userData?.withdrawal || 0}
                        </span>
                    </div>



                </div>

                {/* 🟢 Column 3: Royalty & Profit */}
                <div className="flowchart-column">
                    <div className="flowchart-node flowchart-green" onClick={() => goToPage("ALL")}>
                        Royalty Income <br />
                        <span className="currency1" data-value={userData?.RoyaltyIncome || 0} style={{ color: "#105614", fontWeight: "700" }}>
                            ${userData?.RoyaltyIncome || 0}
                        </span>
                    </div>
                    <div className="flowchart-line-vertical-small"></div>

                    <div className="flowchart-node flowchart-orange" onClick={() => goToPage("ALL")}>
                        Reward Income <br />
                        <span className="currency1" data-value={userData?.Reward || 0} style={{ color: "#105614", fontWeight: "700" }}>
                            ${userData?.Reward || 0}
                        </span>
                    </div>
                </div>

                {/* 🟢 Column 4: Current Bonus & Withdrawal */}
                <div className="flowchart-column">
                    <Link to="/dashboard/Smartwallethistory">
                        <div className="flowchart-node flowchart-green">
                            <div className="" style={{ color: "gray" }}>
                                Smart Wallet <br /></div>
                            <span className="currency1" data-value={userData?.Smart_Wallet || 0} style={{ color: "#105614", fontWeight: "700" }}>
                                ${userData?.Smart_Wallet || 0}
                            </span>
                        </div>
                    </Link>
                    <div className="flowchart-line-vertical-small"></div>

                    <Link to="/dashboard/Smartwallethistory">
                        <div className="flowchart-node flowchart-orange">
                            <div className="" style={{ color: "gray" }}>
                                Smart Debit <br /></div>


                            <span className="currency1" data-value={userData?.Smart_Wallet_debit || 0} style={{ color: "#105614", fontWeight: "700" }}>
                                ${userData?.Smart_Wallet_debit || 0}
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="flowchart-node flowchart-orange d-block d-md-none mt-1" onClick={() => goToPage("FUND WITHDRAWAL")}>
                Withdrawal <br />
                <span className="currency1" data-value={userData?.withdrawal || 0} style={{ color: "#105614", fontWeight: "700" }}>
                    ${userData?.withdrawal || 0}
                </span>
            </div>
        </div>
    );
};

export default Income;