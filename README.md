# VizzyBeats

VizzyBeats allows users to generate unique Spotify playlists from images, tailored to their particular music taste. 
The project uses Google's Vision API to perform image labeling, then uses these labels as queries to the Spotify API to find relevant music.

## Deployment

The backend for the project has been deployed on Render, which contains the Google Cloud credentials for using the Vision API. 
Please do not abuse the backend.

## Demo

1. Login with Spotify

![login](https://github.com/user-attachments/assets/bb0fa247-ef5c-4b78-b884-633a9d84a437)

2. Upload a photo you would like to use for creating a spotify album

![upload](https://github.com/user-attachments/assets/bdf11b56-507d-4155-83a1-bb0eb9eee3b1)

3. Click generate to create a new Spotify album

![generate](https://github.com/user-attachments/assets/588d2b00-da02-4bc4-b018-3840382ed7da)

4. The album has been created and added to your Spotify account. Listen and enjoy!

![Done](https://github.com/user-attachments/assets/8ccb7e83-cb51-4301-b891-6f05d7e0fb85)

## Local Setup

The frontend can be run locally. The backend requires Google Credentials to use the Vision API, which is not included in this repository.
You can either create your own google-credentials.json file and include it in the backend/ directory, or use the deployed Render backend.

To run the frontend, first clone the git repository:
```
git clone https://github.com/WillDinauer/VizzyBeats.git
```

Next, cd into the frontend directory and install the relevant packages
```
cd VizzyBeats/frontend
npm install
```

To run the frontend, run the following and navigate to the local webpage in a browser:
```
npm run dev
```

## Learning Journey

I was inspired to create this project as I've been finding it very difficult to find new music recently, especially music that fits my particular tastes.
That's why I created VizzyBeats, as a fun and interactive way to find something new that users will still (hopefully) enjoy.

In terms of impact, I believe there's tons of other Spotify users who also find it difficult to find new music that they'll enjoy. While Discover Weekly exists,
it often seems biased to suggest music that is only relevant to very recent listening taste, and does not allow for any user input. VizzyBeats allows users to
find music that is relevant to them, while providing some agency in the form of the provided picture. This could help users spice up their stagnant playlists.

To create this project, I refamiliarized myself with React and Node.js to build the frontend and the backend.
I choose these as they are very common for building web-apps, and I already had some experience with them previously. As an added bonus, they are commonly used in industry, and by the DALI lab in particular.
Google's Vision API seemed like a pretty obvious choice in terms of distilling the images into queries, although I would consider replacing this with a more nuanced AI in the future.
The Spotify API was self-evidently essential to the project.

There were some significant challenges and setbacks that I encountered while developing this webapp.
First of all, I was very disheartened after learning that the Get Recommendations API call was deprecated from Spotify's API. This was supposed to be the crux of
how I would find new music relevant to the user. Instead, I had to come up with my own algorithm by stringing together many API calls in a manner that still
would produce a playlist with relevant music. Essentially, the process of finding new music involves finding the top genres for a user (based on their top artists),
then performing a search for various playlists that fit these genres and the key labels from the images. We randomly select tracks from these relevant playlists,
forming a new, unique playlist by the end. While it would have been nice to just use the Get Recommendations API call, the process of developing a new way to get relevant music for the user based on the image
was a fun and engaging challenge, and I've been quite happy with the results.

I also ran into some issues when integration the Vision API. While I was considering only having a frontend to begin with, I quickly realized from reading documentation that the Vision API 
cannot be securely queried from the frontend. This meant I had to develop a dedicated backend as well, which I did not originally plan for. Given that there is now a dedicated backend,
I would certainly consider swapping Spotify authentication methods, allowing users to remain signed in across website visits. Instead, I had already implemented PKCE authentication, which
is still currently being used. In retrospect, I should have done a better job of planning out how these APIs would be integrated in advance, which would have made this a non-issue.

Lastly, my design skills are somewhat lacking so triyng to make the website look somewhat nice has been a challenge. I think it looks okay, but the project would benefit immensely with the insights of a dedicated designer.

In terms of future developments, there are a lot of directions to take the project. For one, I would first want to buy a domain to actually host the website instead of just running it locally.
Next, I would consider adding long-term authentication to spotify with the web app (instead of using PKCE) allowing users to stay signed in when returning to the site.
Additionally, I would consider monitizing the project by integrating the Stripe API and implementing some form of credits. After all, the calls to the Vision API are ultimately not free.
Lastly, having more user input would be nice, such as allowing them to select the number of tracks in the final playlist, or some of the other parameters relevant to the Spotify API calls.

Overall, I had a really enjoyable time setting up everything, and I'm happy with the result of the project. In particular, it's been fun to see the range of results for different images, and I feel much more confident
in terms of learning about and integrating new APIs into future projects.
