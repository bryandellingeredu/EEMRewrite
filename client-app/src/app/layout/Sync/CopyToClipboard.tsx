import { useState } from "react";
import { Button } from "semantic-ui-react";

interface Props {
    text: string;
  }

  export default function CopyToClipboard({text} : Props){
    const [isCopied, setIsCopied] = useState(false);

    const copyText = () => {
        navigator.clipboard.writeText(text).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        });
      };

     

      return (
        <>
          <Button onClick={copyText} color='orange' basic>
            {isCopied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </>
      );
    };


