import { MdOutlineStar, MdOutlineStarOutline } from "react-icons/md";

interface Review {
  id: string;
  title: string;
  stars: number;
  review: string;
  author: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div
      className="flex outline-[1px] outline-[#DFDFDF]/25 w-full flex-col text-black rounded-[20px] bg-gradient-to-br from-white to-[#d9d9d9] p-6 overflow-hidden"
    >
      {/* Stars */}
      <div className="flex items-center rounded-full gap-1 mb-1 md:mb-4">
        {[...Array(5)].map((_, i) => 
          i < review.stars ? (
            <MdOutlineStar
              key={i}
              className={`text-[12px] md:text-2xl fill-yellow-400 text-yellow-400"`}
            />
          ) : (
            <MdOutlineStarOutline
              key={i}
              className={`text-[12px] md:text-2xl text-yellow-400`}
            />
          )
        )}
      </div>

      {/* Title */}
      <h3 className="text-[14px] md:text-[24px] font-normal mb-1 md:mb-4">
        "{review.title}"
      </h3>

      {/* Review Text */}
      <p className="text-[12px] md:text-[16px] font-extralight leading-relaxed mb-1 md:mb-4">
        {review.review}
      </p>

      {/* Author */}
      <p className="text-[12px] md:text-[16px] font-bold">- {review.author}</p>
    </div>
  );
};

export default ReviewCard;
