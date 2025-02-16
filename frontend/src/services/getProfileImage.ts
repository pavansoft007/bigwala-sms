const getProfileImage = (name: string) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
};
export default getProfileImage;

