import { auth, db } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { toast } from "react-toastify";

export default function Post() {
  const [post, setPost] = useState({
    description: "",
  });

  const [user, loading] = useAuthState(auth);
  const route = useRouter();
  const updateData = route.query;

  //submit post to firebase
  const submitPost = async (e) => {
    e.preventDefault();
    const collectionRef = collection(db, "posts");

    if (!post.description) {
      toast.error("Desciption field empty 😅");
      return;
    }

    if (post?.hasOwnProperty("id")) {
      const docRef = doc(db, "posts", post.id);
      const updatedPost = { ...post, timestamp: serverTimestamp() };
      await updateDoc(docRef, updatedPost);
      toast.success("Post updated successfully 😎");
      return route.push("/");
    }

    await addDoc(collectionRef, {
      ...post,
      timestamp: serverTimestamp(),
      user: user.uid,
      avatar: user.photoURL,
      username: user.displayName,
    });
    setPost({ description: "" });
    toast.success("Post created successfully 😎");
    return route.push("/");
  };

  const checkUser = async () => {
    if (loading) return;
    if (!user) route.push("/auth/login");
    if (updateData.id) {
      setPost({ description: updateData.description, id: updateData.id });
    }
  };

  useEffect(() => {
    checkUser();
  }, [user, loading]);

  return (
    <div className="my-20 p-12 shadow-lg rounded-lg max-w-md  mx-auto">
      <form onSubmit={submitPost}>
        <h1 className="text-2xl font-bold">
          {!post.id ? "Create new post" : "Update post"}
        </h1>
        <div className="py-2">
          <h3 className="text-lg font-medium py-2">Description</h3>
          <textarea
            onChange={(e) =>
              e.target.value.length <= 300 &&
              setPost({ ...post, description: e.target.value })
            }
            value={post.description}
            className="bg-gray-800 h-48 w-full text-white rounded-lg p-2 text-sm"
          />
          <p
            className={`my-2 text-cyan-600 font-medium text-sm ${
              post.description.length > 250 ? "text-red-600" : ""
            }`}
          >
            {post.description.length}/300
          </p>
          <button
            type="submit"
            className="w-full bg-cyan-600 text-white font-medium p-2 my-2 rounded-lg text-sm"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
