import { getContent } from "../content/contentStore";

const certificationsContent = getContent("certifications");

export const certifications = certificationsContent.certifications;
export const credentialProfiles = certificationsContent.credentialProfiles;
