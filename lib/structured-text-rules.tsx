import React from "react";
import { renderNodeRule } from "react-datocms";
import {
  isHeading,
  isParagraph,
  isList,
  isListItem,
  isBlockquote,
} from "datocms-structured-text-utils";

export const customRules = [
  // Heading renderer
  renderNodeRule(isHeading, ({ node, children, key }) => {
    const headingClasses = {
      1: "text-[16px] md:text-[20px] font-futura font-bold mb-1 text-black",
      2: "text-xl font-semibold font-futura text-gray-800",
      3: "text-lg font-medium font-futura text-gray-700",
      4: "text-md font-medium font-futura text-black",
      5: "text-base md:text-[20px] font-futura font-light",
      6: "text-base font-medium font-futura text-gray-600",
    };

    const className = headingClasses[node.level as keyof typeof headingClasses];

    switch (node.level) {
      case 1:
        return (
          <h1 key={key} className={className}>
            {children}
          </h1>
        );
      case 2:
        return (
          <h2 key={key} className={className}>
            {children}
          </h2>
        );
      case 3:
        return (
          <h3 key={key} className={className}>
            {children}
          </h3>
        );
      case 4:
        return (
          <h4 key={key} className={className}>
            {children}
          </h4>
        );
      case 5:
        return (
          <h5 key={key} className={className}>
            {children}
          </h5>
        );
      case 6:
        return (
          <h6 key={key} className={className}>
            {children}
          </h6>
        );
      default:
        return (
          <h1 key={key} className={className}>
            {children}
          </h1>
        );
    }
  }),

  // Paragraph renderer
  renderNodeRule(isParagraph, ({ children, key }) => (
    <p key={key} className="text-black text-[12px] md:text-base font-extralight leading-relaxed">
      {children}
    </p>
  )),

  // List renderer
  renderNodeRule(isList, ({ node, children, key }) => {
    if (node.style === "bulleted") {
      return (
        <ul key={key} className="mb-4 ml-6 list-disc space-y-2">
          {children}
        </ul>
      );
    }
    return (
      <ol key={key} className="mb-4 ml-6 list-decimal space-y-2">
        {children}
      </ol>
    );
  }),

  // List item renderer
  renderNodeRule(isListItem, ({ children, key }) => (
    <li key={key} className="text-gray-600">
      {children}
    </li>
  )),

  // Blockquote renderer
  renderNodeRule(isBlockquote, ({ children, key }) => (
    <blockquote
      key={key}
      className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4"
    >
      {children}
    </blockquote>
  )),
];