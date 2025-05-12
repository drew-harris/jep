export type MessageTypes = {
  join: {
    name: string;
  };

  leave: {
    name: string;
  };

  testBuzzStart: {
    teamName: string;
  };

  buzzAccept: {
    teamName: string;
  };
};

export type MessageType = keyof MessageTypes;
export type Message<K extends keyof MessageTypes> = {
  type: K;
  data: MessageTypes[K];
};
