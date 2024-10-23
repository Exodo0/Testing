export default (client) => {
  client.GenIdent = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'ITEM';
    const randomLength = 6;
    let result = prefix + '-';
    
    for (let i = 0; i < randomLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };
};