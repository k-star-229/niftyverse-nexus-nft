import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import CreateNft from "./pages/CreateNft";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Transcation from "./pages/Transcation";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/create-nft" element={<CreateNft />} />
        <Route
          exact
          path="/transaction/:owner/:tokenId/:objectId"
          element={<Transcation />}
        />
        {/* <Route exact path="/transcation" element={<Transcation />} /> */}
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/wallet" element={<Wallet />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
