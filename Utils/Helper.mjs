export const getPostUniqueId = (cloudinaryURL) => {

    const urlComponents = cloudinaryURL.split('/');

    const lastComponent = urlComponents[urlComponents.length - 1];

    const uniqueID = lastComponent.split('.')[0];

    return uniqueID
}