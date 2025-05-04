import { Request, Response } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import News from '../models/news.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

// Fetch news from News API and save to database
export const fetchNewsFromAPI = async (req: Request, res: Response) => {
  try {
    // Using NewsAPI.org as a trusted news source
    // You need to register for an API key at https://newsapi.org/
    const API_KEY = process.env.NEWS_API_KEY || 'your-api-key'; // Store this in .env file
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=id&apiKey=${API_KEY}`);
    
    if (!response.data || !response.data.articles) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Failed to fetch news from API',
      });
    }
    
    // Process and save the news articles
    const newsArticles = response.data.articles.map((article: any) => ({
      title: article.title,
      content: article.content || article.description,
      summary: article.description || (article.content ? article.content.substring(0, 150) + '...' : 'No summary available'),
      imageUrl: article.urlToImage || 'https://via.placeholder.com/300x200?text=No+Image',
      sourceUrl: article.url,
      sourceName: article.source?.name || 'NewsAPI',
      category: mapNewsAPICategoryToLocal(article.source?.category || 'general'),
      publishedAt: new Date(article.publishedAt || Date.now()),
      author: article.author || article.source?.name || 'Unknown',
    }));
    
    // Save to database
    await News.insertMany(newsArticles);
    
    return res.status(HTTP_STATUS.OK).json({
      message: 'News articles fetched and saved successfully',
      count: newsArticles.length,
    });
  } catch (error) {
    console.error('Error fetching news from API:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Helper function to map NewsAPI categories to local categories
const mapNewsAPICategoryToLocal = (newsAPICategory: string): string => {
  const categoryMap: Record<string, string> = {
    general: 'other',
    politik: 'politik',
    ekonomi: 'ekonomi',
    teknologi: 'teknologi',
    hiburan: 'hiburan',
    business: 'business',
    health: 'health',
    science: 'science',
  };
  
  return categoryMap[newsAPICategory.toLowerCase()] || 'other';
};

// Get all news articles with pagination
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const news = await News.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await News.countDocuments();
    
    return res.status(HTTP_STATUS.OK).json({
      news,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting news:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get news by category
export const getNewsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const news = await News.find({ category })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await News.countDocuments({ category });
    
    return res.status(HTTP_STATUS.OK).json({
      news,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting news by category:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get featured news
export const getFeaturedNews = async (req: Request, res: Response) => {
  try {
    const news = await News.find({ isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(5);
    
    return res.status(HTTP_STATUS.OK).json(news);
  } catch (error) {
    console.error('Error getting featured news:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get latest news
export const getLatestNews = async (req: Request, res: Response) => {
  try {
    const news = await News.find()
      .sort({ publishedAt: -1 })
      .limit(5);
    
    return res.status(HTTP_STATUS.OK).json(news);
  } catch (error) {
    console.error('Error getting latest news:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get news by ID
export const getNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'News article not found',
      });
    }
    
    // Increment view count
    news.views += 1;
    await news.save();
    
    return res.status(HTTP_STATUS.OK).json(news);
  } catch (error) {
    console.error('Error getting news by ID:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Create news article (admin only)
export const createNews = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      summary,
      imageUrl,
      sourceUrl,
      sourceName,
      category,
      author,
      isFeatured,
    } = req.body;
    
    // Validation
    if (!title || !content || !imageUrl || !sourceUrl || !category) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS,
      });
    }
    
    const news = new News({
      title,
      content,
      summary: summary || content.substring(0, 150) + '...',
      imageUrl,
      sourceUrl,
      sourceName: sourceName || 'Manual Entry',
      category,
      author: author || req.user?.fullName || 'Admin',
      isFeatured: isFeatured || false,
    });
    
    await news.save();
    
    return res.status(HTTP_STATUS.CREATED).json({
      message: 'News article created successfully',
      news,
    });
  } catch (error) {
    console.error('Error creating news:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Update news article (admin only)
export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'News article not found',
      });
    }
    
    // If summary is not provided but content is updated, generate a new summary
    if (updateData.content && !updateData.summary) {
      updateData.summary = updateData.content.substring(0, 150) + '...';
    }
    
    const updatedNews = await News.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    
    return res.status(HTTP_STATUS.OK).json({
      message: 'News article updated successfully',
      news: updatedNews,
    });
  } catch (error) {
    console.error('Error updating news:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Delete news article (admin only)
export const deleteNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'News article not found',
      });
    }
    
    await News.findByIdAndDelete(id);
    
    return res.status(HTTP_STATUS.OK).json({
      message: 'News article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Search news by keyword
export const searchNews = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    if (!keyword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Search keyword is required',
      });
    }
    
    const searchRegex = new RegExp(keyword as string, 'i');
    
    const news = await News.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { summary: searchRegex },
        { author: searchRegex },
      ],
    })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await News.countDocuments({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { summary: searchRegex },
        { author: searchRegex },
      ],
    });
    
    return res.status(HTTP_STATUS.OK).json({
      news,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching news:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};