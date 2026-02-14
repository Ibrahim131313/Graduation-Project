# Embeddings and store in Pinecone

from dotenv import load_dotenv
import os
from src.helper import load_pdf_files, filter_to_minimal_docs, text_split, download_embeddings
from pinecone import Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Validate required API keys
if not PINECONE_API_KEY or PINECONE_API_KEY == "your_pinecone_api_key_here":
    print("ERROR: PINECONE_API_KEY is not set or is placeholder. Please set a valid key in .env")
    exit(1)

if not GOOGLE_API_KEY or GOOGLE_API_KEY == "your_google_api_key_here":
    print("ERROR: GOOGLE_API_KEY is not set or is placeholder. Please set a valid key in .env")
    exit(1)

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Initialize Pinecone client immediately after loading environment variables
pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "medical-chatbot"

# Check if index already exists using list_indexes()
existing_indexes = pc.list_indexes()
existing_index_names = {idx.name for idx in existing_indexes}

if index_name in existing_index_names:
    # Index already exists; avoid re-ingesting data to save startup time and RAM
    print(f"Index '{index_name}' already exists, skipping data upload.")
else:
    print(f"Index '{index_name}' does not exist. Creating index and uploading data...")

    # Create the index
    pc.create_index(
        name=index_name,
        dimension=768,  # Dimension of Google embeddings model "models/embedding-001"
        metric="cosine",  # Similarity metric
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

    # Load and process documents only when creating the index
    extracted_data = load_pdf_files(data='data/')
    minimal_docs = filter_to_minimal_docs(extracted_data)
    text_chunks = text_split(minimal_docs)

    # Initialize embeddings only when needed
    embeddings = download_embeddings()

    # Upload documents to Pinecone
    PineconeVectorStore.from_documents(
        documents=text_chunks,
        embedding=embeddings,
        index_name=index_name
    )
