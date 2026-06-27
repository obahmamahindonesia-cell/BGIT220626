-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TEST_TAKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Dimension" AS ENUM ('LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'SHORT_ANSWER', 'ESSAY', 'AUDIO_RESPONSE', 'INTEGRATED_TASK');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'REVIEW', 'PILOT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "CEFRLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('CONFIGURED', 'IN_PROGRESS', 'SUBMITTED', 'SCORED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "StimulusType" AS ENUM ('TEXT', 'AUDIO', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "BlueprintProduct" AS ENUM ('ACADEMIC', 'PROFESSIONAL', 'PLACEMENT', 'PRACTICE');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('PENDING', 'INVITED', 'REGISTERED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TEST_TAKER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER,
    "profession" TEXT,
    "targetLevel" TEXT,
    "currentLevel" TEXT,
    "testGoals" TEXT[],
    "hasPreviousTest" BOOLEAN NOT NULL DEFAULT false,
    "previousTestType" TEXT,
    "learningDuration" TEXT,
    "estimatedLevel" TEXT,
    "preferredDuration" INTEGER NOT NULL DEFAULT 60,
    "practiceMode" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "technicalCheckPassed" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "displayName" TEXT,
    "country" TEXT,
    "city" TEXT,
    "firstLanguage" TEXT,
    "bio" TEXT,
    "institution" TEXT,
    "occupation" TEXT,
    "focusSkills" TEXT[],
    "preferredLanguage" TEXT NOT NULL DEFAULT 'id',
    "timezone" TEXT,
    "certificateVisibility" TEXT NOT NULL DEFAULT 'private',
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionStimulus" (
    "id" TEXT NOT NULL,
    "type" "StimulusType" NOT NULL DEFAULT 'TEXT',
    "title" TEXT,
    "content" TEXT,
    "assetUrl" TEXT,
    "transcript" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionStimulus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionRubric" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "dimension" "Dimension",
    "level" "CEFRLevel",
    "criteria" JSONB,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionRubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionItem" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "dimension" "Dimension" NOT NULL,
    "subskill" TEXT,
    "questionType" "QuestionType" NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "topic" TEXT,
    "prompt" TEXT,
    "instruction" TEXT,
    "correctAnswer" JSONB,
    "explanation" TEXT,
    "estimatedTime" INTEGER,
    "tags" TEXT[],
    "status" "QuestionStatus" NOT NULL DEFAULT 'DRAFT',
    "exposureCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stimulusId" TEXT,
    "rubricId" TEXT,
    "authorId" TEXT,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "QuestionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestBlueprint" (
    "id" TEXT NOT NULL,
    "product" "BlueprintProduct" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "defaultQuestionCount" INTEGER NOT NULL DEFAULT 25,
    "dimensionWeights" JSONB,
    "levelDistribution" JSONB,
    "questionTypeDistribution" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "product" TEXT,
    "targetLevel" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'CONFIGURED',
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "totalScore" DOUBLE PRECISION,
    "cefrLevel" TEXT,
    "metadata" JSONB,

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSessionItem" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "dimension" "Dimension",
    "level" "CEFRLevel",
    "difficulty" INTEGER,
    "questionSnapshot" JSONB,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "stage" INTEGER DEFAULT 1,

    CONSTRAINT "TestSessionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" TEXT NOT NULL,
    "sessionItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" JSONB,
    "score" DOUBLE PRECISION,
    "aiScore" DOUBLE PRECISION,
    "aiFeedback" TEXT,
    "isCorrect" BOOLEAN,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseText" TEXT,
    "responseAudioUrl" TEXT,
    "responseAudioMimeType" TEXT,
    "audioDurationSec" INTEGER,
    "audioFileSize" INTEGER,
    "audioStoragePath" TEXT,
    "audioStorageProvider" TEXT,
    "wordCount" INTEGER,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewerScoreJson" JSONB,
    "finalScoreJson" JSONB,
    "internalNotes" TEXT,
    "responseStatus" TEXT NOT NULL DEFAULT 'submitted',
    "autoScoreJson" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemStatistic" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "accuracyRate" DOUBLE PRECISION,
    "avgScore" DOUBLE PRECISION,
    "avgTimeSeconds" DOUBLE PRECISION,
    "discriminationIndex" DOUBLE PRECISION,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "ItemStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overallLevel" "CEFRLevel" NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "listeningScore" DOUBLE PRECISION,
    "readingScore" DOUBLE PRECISION,
    "speakingScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "mediationScore" DOUBLE PRECISION,
    "integratedScore" DOUBLE PRECISION,
    "toefEquivalent" INTEGER,
    "ieltsEquivalent" DOUBLE PRECISION,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "testResultId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "overallLevel" "CEFRLevel" NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrCodeUrl" TEXT,
    "pdfUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "institution" TEXT,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "invitedAt" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanDoDescriptor" (
    "id" TEXT NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "skill" "Dimension" NOT NULL,
    "category" TEXT,
    "descriptor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanDoDescriptor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeQuestion" (
    "id" TEXT NOT NULL,
    "dimension" "Dimension" NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pdfUrl" TEXT,
    "storagePath" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_createdAt_idx" ON "LoginHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LoginHistory_createdAt_idx" ON "LoginHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionItem_code_key" ON "QuestionItem"("code");

-- CreateIndex
CREATE INDEX "QuestionItem_dimension_level_status_idx" ON "QuestionItem"("dimension", "level", "status");

-- CreateIndex
CREATE INDEX "QuestionItem_status_idx" ON "QuestionItem"("status");

-- CreateIndex
CREATE INDEX "QuestionItem_level_idx" ON "QuestionItem"("level");

-- CreateIndex
CREATE INDEX "QuestionItem_dimension_idx" ON "QuestionItem"("dimension");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TestBlueprint_product_key" ON "TestBlueprint"("product");

-- CreateIndex
CREATE INDEX "TestSession_userId_status_idx" ON "TestSession"("userId", "status");

-- CreateIndex
CREATE INDEX "TestSession_userId_startedAt_idx" ON "TestSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "TestSessionItem_sessionId_order_idx" ON "TestSessionItem"("sessionId", "order");

-- CreateIndex
CREATE INDEX "TestSessionItem_questionId_idx" ON "TestSessionItem"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnswer_sessionItemId_key" ON "UserAnswer"("sessionItemId");

-- CreateIndex
CREATE INDEX "UserAnswer_userId_idx" ON "UserAnswer"("userId");

-- CreateIndex
CREATE INDEX "UserAnswer_sessionItemId_idx" ON "UserAnswer"("sessionItemId");

-- CreateIndex
CREATE INDEX "UserAnswer_responseStatus_idx" ON "UserAnswer"("responseStatus");

-- CreateIndex
CREATE INDEX "ItemStatistic_questionId_idx" ON "ItemStatistic"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemStatistic_questionId_key" ON "ItemStatistic"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_sessionId_key" ON "TestResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateId_key" ON "Certificate"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_testResultId_key" ON "Certificate"("testResultId");

-- CreateIndex
CREATE INDEX "Certificate_certificateId_idx" ON "Certificate"("certificateId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_userId_key" ON "Waitlist"("userId");

-- CreateIndex
CREATE INDEX "CanDoDescriptor_level_skill_idx" ON "CanDoDescriptor"("level", "skill");

-- CreateIndex
CREATE INDEX "PracticeQuestion_dimension_cefrLevel_idx" ON "PracticeQuestion"("dimension", "cefrLevel");

-- CreateIndex
CREATE INDEX "PracticeQuestion_isActive_idx" ON "PracticeQuestion"("isActive");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionItem" ADD CONSTRAINT "QuestionItem_stimulusId_fkey" FOREIGN KEY ("stimulusId") REFERENCES "QuestionStimulus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionItem" ADD CONSTRAINT "QuestionItem_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "QuestionRubric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSessionItem" ADD CONSTRAINT "TestSessionItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSessionItem" ADD CONSTRAINT "TestSessionItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_sessionItemId_fkey" FOREIGN KEY ("sessionItemId") REFERENCES "TestSessionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemStatistic" ADD CONSTRAINT "ItemStatistic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_testResultId_fkey" FOREIGN KEY ("testResultId") REFERENCES "TestResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

