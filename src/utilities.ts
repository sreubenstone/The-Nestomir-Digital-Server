const authGuard = next => (root, args, context, info) => {
  if (!context.user) {
    throw new Error(`Unauthenticated!`);
  }

  return next(root, args, context, info);
};

function avatar() {
  const imgs = [
    'https://kids.nationalgeographic.com/content/dam/kids/photos/animals/Mammals/H-P/pig-young-closeup.ngsversion.1412640764383.jpg',
    'https://cdn.pixabay.com/photo/2016/03/09/15/18/pig-1246584_960_720.jpg',
    'https://media2.s-nbcnews.com/j/newscms/2019_15/1425069/barsik-41-pound-cat-today-main-190411-05_1e8dd7af73408f9713c40a6c699422a3.fit-760w.jpg',
    'https://s3.amazonaws.com/spectrumnews-web-assets/wp-content/uploads/2018/11/13154625/20181112-SHANK3monkey-844.jpg',
    'https://cdn.vox-cdn.com/thumbor/Or0rhkc1ciDqjrKv73IEXGHtna0=/0x0:666x444/1200x800/filters:focal(273x193:379x299)/cdn.vox-cdn.com/uploads/chorus_image/image/59384673/Macaca_nigra_self-portrait__rotated_and_cropped_.0.jpg',
    'https://s3.amazonaws.com/cdn-origin-etr.akc.org/wp-content/uploads/2018/09/10222609/shiba-inu-funny-close-up-portrait.jpg',
    'https://store-images.s-microsoft.com/image/apps.16144.9007199266425000.e85a84c4-8eca-435c-acd0-67b6a00f5003.bb42a209-51fa-497c-9820-a245bb01b281?mode=scale&q=90&h=300&w=300',
    'http://cdn.akc.org/content/article-body-image/funny-basset_hound_yawning.jpg',
    'https://media.mnn.com/assets/images/2013/09/funny%20dog2.jpg.560x0_q80_crop-smart.jpg',
    'https://images.unsplash.com/photo-1534958210670-31215027cb02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
  ]

  const selection = imgs[Math.floor(Math.random() * imgs.length)]
  return selection
}



export { authGuard, avatar };
