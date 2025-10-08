import { actions } from "astro:actions";
import type { InputHTMLAttributes } from "preact";
import { useEffect, useRef, useState } from "preact/compat";
import slugify from "@sindresorhus/slugify";
import Tagify from "@yaireo/tagify";
import "@yaireo/tagify/dist/tagify.css";
import "./TagsInput.css";

interface TagsInputProps extends InputHTMLAttributes<HTMLInputElement> {
  tagType: "character" | "relationship" | "series" | "warnings";
}

export default function TagsInput(props: TagsInputProps) {
  interface TagData extends Tagify.BaseTagData {
    label: string;
    slug: string;
    type: "character" | "relationship" | "series" | "warnings";
  }

  const ref = useRef<HTMLInputElement | null>(null);
  const [tags, setTags] = useState<TagData[]>([]);
  const [whitelist, setWhitelist] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSetDropdown(e: Event) {
    let data = (e.currentTarget as HTMLInputElement).value;
    setLoading(true);
    const tags = await actions.tagsActions.fetchTags({ tags: data });
    if (tags.data) { setWhitelist(tags.data as TagData[]); }
    setLoading(false);
  }

  useEffect(() => {
    let tagify: Tagify<TagData> | undefined;

    if (ref.current) {
      tagify = new Tagify<TagData>(ref.current, {
        callbacks: {
          add(e) {
            console.log("this is data: " + JSON.stringify(e.detail.data));
          },
        },
        // classNames: {

        // },
        dropdown: {
          appendTarget: () => ref.current!,
          searchKeys: ["value", "searchBy", "slug"],
        },
        duplicates: false,
        transformTag(tagData) {
          tagData.slug = slugify(tagData.value);
          tagData.type = props.tagType;
        },
        // validate(tagData) {
        //   console.log("validate: " + tagData);
        //   if (whitelist.find(({ slug }) => slug === slugify(tagData.slug))) {
        //     return "Can't have duplicate";
        //   }
        //   return true;
        // },
        whitelist,
      });

      tagify.loading(loading);
      
      tagify.on("input", (e) => {
        console.log("input event start: " + e.detail.tagify.getInputValue());
        setWhitelist([]);

      });
    }

    return () => {
      tagify?.destroy();
    }
  }, [ref.current]);

  return <input
    type="hidden" 
    ref={ref} 
    data-type={props.tagType} 
    {...props} 
  />
}