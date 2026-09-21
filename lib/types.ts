export type SystemProfile = {
  distro: string;
  version: string;
  desktop: string;
  session: string;
  hardware: string;
};

export type AskRequest = {
  question: string;
  profile: SystemProfile;
};
