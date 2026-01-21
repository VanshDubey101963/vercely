import { useEffect, useState, type ReactElement } from "react";
import { Typography } from "@material-tailwind/react";

interface ProgressType {
  progressPercent: number;
  progressString: string;
}

function ProgressComponent({
  progressPercent,
  progressString,
}: ProgressType): ReactElement {
  return (
    <div className="w-full mt-5">
      <div className="mb-2 flex items-center justify-between gap-4">
        <Typography color="white" variant="h6">
          {progressString}
        </Typography>
        <Typography color="white" variant="h6">
          {progressPercent}%
        </Typography>
      </div>
      <div className="bg-gray-700 w-full h-2 rounded-lg relative">
        <div className="bg-white h-2 rounded-lg" style={{ width: `${progressPercent}%` }}></div>
      </div>
    </div>
  );
}

interface UrlCardProps {
  url: string;
}

function UrlCard({ url }: UrlCardProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    window.open(`http://${url}`, "_blank");
  };

  return (
    <div className="mt-20 max-w-lg mx-auto bg-black border border-white rounded-lg p-4 shadow-lg">
      <p className="text-white text-lg font-semibold break-all">
        {url}
      </p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleOpen}
          className="flex-1 bg-white text-black font-medium py-2 rounded hover:bg-gray-200 transition"
        >
          Open Link
        </button>

        <button
          onClick={handleCopy}
          className="flex-1 bg-transparent border border-white text-white font-medium py-2 rounded hover:bg-white hover:text-black transition"
        >
          Copy Link
        </button>
      </div>
      {copied && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded">
          Copied!
        </div>
      )}
    </div>
  );
}

function App() {
  const [status, setStatus]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>("");
  const [id, setId]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>("");
  const [url, setUrl]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>("");
  const [siteURL, setSiteURL]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>("");

  useEffect(() => {
    // if id is empty, do nothing
    if (!id) return;

    console.log(siteURL);

    console.log("Starting interval with id:", id);

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_UPLOAD_SERVICE_URL}/status/${id}`,
        );

        if (!response.ok) {
          console.error("Fetch failed:", response.status);
          return;
        }

        const data = await response.json();

        if (data.status) {
          setStatus(data.status);
        }

        if (data.status === "deployed") {
          setSiteURL(`${id}.${import.meta.env.VITE_REQUEST_DOMAIN_NAME}`);
        }
      } catch (err) {
        console.error("Error in fetch:", err);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const deploy = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("pending");
    const response: Response = await fetch(
      `${import.meta.env.VITE_UPLOAD_SERVICE_URL}/deploy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
        }),
      },
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    console.log(data);

    setId(data.id);
    console.log("id: ", id);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className=" border h-150 p-3 w-200 flex-col flex gap-5">
        <h1 className="text-white text-3xl font-bold">
          Let's build something new
        </h1>
        <form
          onSubmit={deploy}
          className="flex gap-2 border-gray-500 border rounded-sm "
        >
          <input
            type="url"
            onChange={handleInputChange}
            placeholder="Enter a Git Repository URL to Deploy..."
            className=" text-white  p-1 text-xm w-[90%] h-10 "
          ></input>
          <button
            type="submit"
            className="bg-white  text-black p-1 text-xm rounded-sm w-[10%]"
          >
            Deploy
          </button>
        </form>
        <div className="flex justify-center ">
          {status && (
            <ProgressComponent
              progressString={status.charAt(0).toUpperCase() + status.slice(1)}
              progressPercent={
                status === "pending"
                  ? 20
                  : status === "uploaded"
                    ? 50
                    : status === "deployed"
                      ? 100
                      : 0
              }
            />
          )}
        </div>
        {status == "deployed" && 
          <UrlCard url={siteURL} />
        }
        
      </div>
    </div>
  );
}

export default App;
