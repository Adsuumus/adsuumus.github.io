import { useSearchParams } from "react-router-dom";

import { Maya } from "./Maya";
import { CropperPage } from "./Cropper";

function App() {
  const [searchParams] = useSearchParams();

  return (
    <>
      {searchParams.has("cropper") ? <CropperPage /> : <Maya />}

      <div style={{ padding: 10 }}>05.08</div>
    </>
  );
}

export default App;
