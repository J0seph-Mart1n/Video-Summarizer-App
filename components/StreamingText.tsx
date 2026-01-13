import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import Markdown from 'react-native-markdown-display';

type Props = {
  text: string;
  speed?: number; // ms per character
};

export default function StreamingText({
  text,
  speed = 20,
}: Props) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return <Markdown>{displayedText}</Markdown>;
}
